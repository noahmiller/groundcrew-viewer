//
// GROUNDCREW VIEWER<->SERVER COMMUNICATIONS
//
// To communicate with the server, the viewer polls a file every 20s
// at http://[SERVER]/data/this10.js, which contains all events from 
// the last few minutes.  The server returns javascript which calls a 
// limited set of four functions: {item,event,city,idea}, defined at 
// the bottom of this file.  These functions, when called, add or update
// entries in an in-browser, in-memory database which is used to draw
// them map and fill out the UI.
//


Ajax = {
  interval: 20 * 1000,
  timer: null,

  uuid: function() {
    return agent_tag + '_' + new Date().getTime();
  },
  
  init: function() {
    $("body").bind("ajaxSend", function(){
      clearTimeout(Ajax.timer);
      $(this).addClass('refresh');
    }).bind("ajaxComplete", function(){
      Ajax.schedule_autoload();
      $(this).removeClass('refresh');
    });

    $.ajaxSetup({
      error: function(req, textStatus, errorThrown){
        if (req.status == 404) return;
        if (errorThrown){ throw errorThrown; }
        if (req.responseText) $.facebox(req.responseText);
      }
    });

    EventDb.new_events_are_new = true;
    Ajax.schedule_autoload();
  },

  schedule_autoload: function(){
    if (Ajax.timer) clearTimeout(Ajax.timer);
    Ajax.timer = setTimeout(Ajax.autoload, Ajax.interval);
  },

  autoload: function(){
    $.getScript('/data/this10.js');
    /*
    // debug
    event("Annc__2600",1234657935,"assignment","Person__51315",null,null,null,"Person__12",null,{"msg":"bounce!", 'landmark_tag':'Landmark__1'});
    event("Annc__2601",1234658435,"said","Person__12",'Annc__2600',null,null,"Person__1",null,{"msg":"gonna make it so!"});
    */

    if (EventDb.watch_needs_update) {
      EventDb.watch_needs_update = false;
      //$('#live_event_iw').app_paint(); // debug
      MapMarkers.open(Viewer.current_app.state.item, $.template('#live_event_iw').app_paint()[0], 16);
    }
    //Ajax.timer = setTimeout(Ajax.autoload, Ajax.interval); // debug
  },

  fetch: function(url, options, after){
    $.getJSON(url, options, function(obj){
      if (obj.error){ alert("Note: " + obj.error); return; }
      if (after) after(obj);
    });
  }

};


// item - an item on the map
function item(city_id, tag, title, thumb_url, lat, lng, atags, latch, comm, req, json_etc){
  var parts = tag.split('__');
  return Resource.add_or_update($.extend({
    id: Number(parts[1]),
    item_tag: tag,
    title: title,
    thumb_url: thumb_url,
    city_id: city_id,
    lat: lat,
    lng: lng,
    atags: atags,
    latch: latch,
    comm: comm,
    req: req
  }, json_etc));
}

var cities = {};
var city_locs = {};

// city - a city in which there is groundcrew activity
function city(id, title, lat, lng, agent_count){
  var parts = title.split(', ');
  cities[id] = parts[0];
  city_locs[id] = [lat, lng];
}

// idea - a template for a gathering
function idea(tag, title, atags, ltypes, json_etc){
  var parts = tag.split('__');
  Resource.add_or_update($.extend({
    id: Number(parts[1]),
    item_tag: tag,
    title: title,
    atags: atags
  }, json_etc));
}

EventDb = {};
EventDb.events = [];
EventDb.seen = {};
EventDb.watched = {};
EventDb.watch_needs_update = false;
EventDb.new_events_are_new = false;

// event - anything that happened
function event(annc_tag, created_at, atype, actor_tag, re, atags, city_id, item_tag, item_changes, json_etc){

  if (EventDb.seen[annc_tag]) return;

  var event = $.extend({
    annc_tag: annc_tag,
    item_tag: item_tag,
    created_at: created_at,
    atype: atype,
    actor_tag: actor_tag,
    re: re,
    atags: atags,
    city_id: city_id
  }, json_etc);
  EventDb.seen[annc_tag] = event;

  // handle any item changes packed in this event
  if (item_tag && item_changes) {
    var item = item_tag.resource();
    $.extend(item, item_changes);
    Resource.add_or_update(item);
  };

  // add it to the list of all events
  EventDb.events.push(event);
  if (atype == 'said') Chat.chats.push(event);
  if (atype == 'off') Agents.remove(item_tag);

  if (EventDb.new_events_are_new){
    if (atype == 'said') Chat.update();
    Notifier.did_add_new_event(event);
  }

  // add landmark tag to the list watched by current agent + flag update
  if (agent_tag == actor_tag && json_etc['landmark_tag']) {
    EventDb.watched[json_etc['landmark_tag']] = annc_tag;
    EventDb.watch_needs_update = true;
  }
  // flag update if this event relates to a watched one
  if (EventDb.seen[re]) {
    var parent_landmark_tag = EventDb.seen[re].landmark_tag;
    if (EventDb.watched[parent_landmark_tag] &&
      parent_landmark_tag == Viewer.current_app.state.item) {
      EventDb.watch_needs_update = true;
    }
  }

  return event;
}

// login - called to specify the operator of the viewer
function login(user_info){
  agent_tag = user_info.tag;
  person_item = agent_tag.resource();
  $.extend(person_item, user_info);
  logged_in = true;
}
