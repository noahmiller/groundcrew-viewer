Landmark = {};
LandmarkDb = {
  
  landmarks_by_city: {},
  
  add: function(lm) {
    lm.landmark_tag = lm.item_tag;
    LandmarkDb.landmarks_by_city[lm.city_id].push(lm);
    MapMarkers.new_landmark(lm);
  },
    
  ensure_landmarks: function(city_id) {
    if (LandmarkDb.landmarks_by_city[city_id]) return;
    $.ajax({
      url: '/gc/viewer_city.js',
      data: {city_id: city_id},
      async: false,
      // dataType: 'json',
      success: function(obj){ 
        eval(obj);
        // LandmarkDb.landmarks_by_city[city_id] = obj;
      }
    });
  },
  
  find_by_tag: function(tag) {
    var lms = LandmarkDb.landmarks_by_city[Viewer.selected_city];
    if (!lms) return;
    var idx = {};
    $.each(lms, function(){
      this.landmark_tag = this.item_tag;
      idx[this.item_tag] = this;
    });
    return idx[tag];
  }
    
};
