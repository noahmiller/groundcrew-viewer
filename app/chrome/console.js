Console = {
  modes: [],
  tools: {}  
};

// add_action_idea//wand30  edit_activities//lightbulb_icon29  identify_resource//gift23  upload_landmarks//landmark21

$.each([
  'assess     show_answers//scroll     ask_a_question            view_events//scroll',
  'manage     add_landmark//landmark21  approve_deputies     chat//chat_icon18    squad_settings',
  'dispatch     assign_agents            start_something           join_something'
], function(){
  
  var words = this.split(/\s+/);
  var mode = words.shift();
  Console.modes.push(mode);
  Console.tools[mode] = words;
  
});


LiveHTML.widgets.push({
  
  tool_buttons: function() {
    if (!This.mode || !Console.tools[This.mode]) return '';
    return Console.tools[This.mode].map(function(x){
      var parts = x.split('//');
      var tool = parts[0];
      var tname = tool.replace(/_/g, ' ');
      var img = parts[1] && '<img src="i/icons/'+parts[1]+'.png"/>' || '';
      return '<a class="'+tool+'_tool" href="#tool='+tool+'">'+img+tname+'</a>';
    }).join('');
  }

});



// HELP


// <div id="coordinate_mode_buttons">
//   <img reveal="places_palette" src="i/icons/landmark21.png" title="see local places"/>      
//   <img reveal="recent_content" src="i/icons/scroll.png" title="view recent events"/>
// </div>
// <div id="listen_mode_buttons">
//   <img reveal="share_palette" src="i/icons/gift23.png" title="free stuff"/>
//   <img reveal="chat_palette" src="i/icons/chat_icon18.png" title="chat with other organizers"/>
//   <img reveal="wish_palette" src="i/icons/wand30.png" title="make or view wishes"/>
// </div>

