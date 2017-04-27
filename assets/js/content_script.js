(function(window, jQuery) {
	
  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {

      // Table Grabber...
      case "GrabTable":

        if ($("#table-grabber-form").length > 0)
          $("#table-grabber-form").remove();
        if ($(".table-overlay").length > 0)
          $(".table-overlay").remove();

        // Add Grab Table form
        var url = chrome.extension.getURL("/assets/html/grab-form.html");
        $("body").append("<div id='table-grabber-form'></div>");
        $("#table-grabber-form").load(url);

        // Overlay the tables
        for(var i = 0 ; i < $("table").length; i++){
          var position = $("table").eq(i).offset();
          var size = {
            "width": $("table").eq(i).width(),
            "height": $("table").eq(i).height()
          }
          $("body").append("<div class='table-overlay'></div>");
          $(".table-overlay").eq(i).css(position);
          $(".table-overlay").eq(i).css(size);
        }
        sendResponse();
        return true;
        break;


      // Get Current Tab URL...
      case "GetCurrentTabUrl":
        var location = window.location.href;
        sendResponse(location);
        return true;
        break;
        

      // Create Stub Article...
      case "CreateStubArticle":
        var stubArticle = {
          "title": "",
          "blurb": "",
          "body": ""
        }

        if($("title").length > 0){
          stubArticle.title = $("title").text().trim();
        }

        if($("meta").length > 0){
          var articleMeta = $("meta[name='description']") ? $("meta[name='description']") : $("meta[property='og:description']");

          stubArticle.blurb = articleMeta.attr("content");
          if (articleMeta.attr("content") == undefined) {
            stubArticle.body = window.location.href;
          } else {
            stubArticle.body = articleMeta.attr("content") + "<br /><br />" + window.location.href;  
          }
        }

        sendResponse(stubArticle);
        return true;
        break;
        

      case "RestoreAutoSaveArticle":
        var autoSaveArticle = request.data;
        $("#edit-title").val(autoSaveArticle.title);
        $("#edit-field-short-title-und-0-value").val(autoSaveArticle.short_title);
        $("#edit-field-blurb-und-0-value").val(autoSaveArticle.blurb);
        $("#edit-field-introduction-und-0-value").val(autoSaveArticle.introduction);
        $("#edit-field-social-blurb-und-0-value").val(autoSaveArticle.social_blurb);

        $(".cke_wysiwyg_frame").contents().find( "body" ).html(autoSaveArticle.body);

        sendResponse();
        return true;
        break;
        
      default:
        break;

    }
  });
  
  var save_timer = null;
  var timer = setInterval(function() {
    
    chrome.extension.sendMessage({
      msg: 'GetProfile'
    }, function(profile){
      if(profile != null){
        var article_url = profile.ARTICLE_EDIT_URL;
        var current_location = window.location.href;
        if(current_location.indexOf(article_url) > -1 ){

          // Save New Article
          if(save_timer == null){
            save_timer = setInterval(saveArticle, 30000);
          }
          
          // Quick Publish Action
          chrome.extension.sendMessage({
            msg: 'GetStubArticle'
          }, function(response){
            if (response != null) {
              var articleStub = response;
              
              $("#edit-title").val(articleStub.title);
              $("#edit-field-blurb-und-0-value").val(articleStub.blurb);

              $(".cke_wysiwyg_frame").contents().find("body").html(articleStub.body);
              chrome.extension.sendMessage({
                msg: 'RemoveStubArticle'
              }, function(){});
            }
          });
          
          // Restore Last Saved Article
          chrome.extension.sendMessage({
            msg: 'GetAutoSaveCloneArticle'
          }, function(response) {
            if (response != null) {
              var autoSavedArticle = response;
              $("#edit-title").val(autoSavedArticle.title);
              $("#edit-field-short-title-und-0-value").val(autoSavedArticle.short_title);
              $("#edit-field-blurb-und-0-value").val(autoSavedArticle.blurb);
              $("#edit-field-introduction-und-0-value").val(autoSavedArticle.introduction);
              $("#edit-field-social-blurb-und-0-value").val(autoSavedArticle.social_blurb);

              $(".cke_wysiwyg_frame").contents().find("body").html(autoSavedArticle.body);
              chrome.extension.sendMessage({
                msg: 'RemoveAutoSaveCloneArticle'
              }, function(){});
            }
          });
        } else if(checkEditPage(current_location, profile.SITE_URL)){

          console.log("You are in Edit Page");

          //Save Editing Article
          if(save_timer == null){
            save_timer = setInterval(saveEditingArticle, 30000);
          }
          
          // Restore savedEditing Article 
          chrome.extension.sendMessage({
            msg: 'GetAutoSaveCloneArticle'
          }, function(response) {
            if (response != null) {
              var autoSavedArticle = response;
              $("#edit-title").val(autoSavedArticle.title);
              $("#edit-field-short-title-und-0-value").val(autoSavedArticle.short_title);
              $("#edit-field-blurb-und-0-value").val(autoSavedArticle.blurb);
              $("#edit-field-introduction-und-0-value").val(autoSavedArticle.introduction);
              $("#edit-field-social-blurb-und-0-value").val(autoSavedArticle.social_blurb);

              $(".cke_wysiwyg_frame").contents().find("body").html(autoSavedArticle.body);
              chrome.extension.sendMessage({
                msg: 'RemoveAutoSaveCloneArticle'
              }, function(){});
            }
          });
        }
      }
    });
  },2000);
  
  function checkEditPage(current_location, site_url){

    if(current_location.indexOf(site_url) == -1)
      return false;

    var regExpArray = [/https:\/\/www\.1stohiobattery\.com\/node\/\d*\/edit\S*/,/https:\/\/www\.elevenwarriors\.com\/node\/\d*\/edit\S*/,/https:\/\/www\.goiowaawesome\.com\/node\/\d*\/edit\S*/,/https:\/\/www\.roarlionsroar\.com\/node\/\d*\/edit\S*/];
    
    var flag = false;
    for(var i = 0 ; i < regExpArray.length ; i++){
      regExp = regExpArray[i];
      var result = regExp.exec(current_location);
      if(result != null){
        flag = true;
        break;
      }
    }
    
    return flag;
  }

  function saveArticle() {
    var autoSaveArticle = {
      "title": "",
      "short_title": "",
      "blurb": "",
      "introduction": "",
      "social_blurb": "",
      "body": "",
    };
    
    autoSaveArticle.title = $("#edit-title").val();
    autoSaveArticle.short_title = $("#edit-field-short-title-und-0-value").val();
    autoSaveArticle.blurb = $("#edit-field-blurb-und-0-value").val();
    autoSaveArticle.introduction = $("#edit-field-introduction-und-0-value").val();
    autoSaveArticle.social_blurb = $("#edit-field-social-blurb-und-0-value").val();
    
    bodyHtml = $(".cke_wysiwyg_frame").contents().find("body").html();
    if (bodyHtml && bodyHtml.length > 20)
      autoSaveArticle.body = bodyHtml;

    if (autoSaveArticle.body.length > 20) {
      chrome.extension.sendMessage({
          msg: 'AutoSaveArticle',
          data: autoSaveArticle
        }, function(response){});
    }
  }

  function saveEditingArticle() {
    var condition1 = $("#edit-status").prop("checked");
    var condition2 = $("#edit-field-feature-und").length > 0 ? true : false;
    if((condition1 == false) || (condition2 == false))
      return false;

    var autoSaveArticle = {
      "title": "",
      "short_title": "",
      "blurb": "",
      "introduction": "",
      "social_blurb": "",
      "body": "",
      "url": window.location.href
    };
    
    autoSaveArticle.title = $("#edit-title").val();
    autoSaveArticle.short_title = $("#edit-field-short-title-und-0-value").val();
    autoSaveArticle.blurb = $("#edit-field-blurb-und-0-value").val();
    autoSaveArticle.introduction = $("#edit-field-introduction-und-0-value").val();
    autoSaveArticle.social_blurb = $("#edit-field-social-blurb-und-0-value").val();
    
    bodyHtml = $(".cke_wysiwyg_frame").contents().find("body").html();
    if (bodyHtml && bodyHtml.length > 20)
      autoSaveArticle.body = bodyHtml;

    if (autoSaveArticle.body.length > 20) {
      chrome.extension.sendMessage({
          msg: 'AutoSaveArticle',
          data: autoSaveArticle
        }, function(response){});
    }
  }

  $(document).on('click', '.table-overlay', function () {
    var index = $(".table-overlay").index($(this));
    var data = $("table").eq(index).clone();

    $("#table-grabber-form").find("#txtTableCode").val("");

    // Remove unwanted tags...
    $(data).find("em, strong, i, b, u, span, div, font, p, ul, ol, li, a").each(function() {
      if ($(this).is(':empty')) {
        $(this).remove();
      } else {
        $(this).contents().unwrap();  
      }
    });

    // Remove unwanted attributes...
    var attrWhiteList = ["colspan","rowspan"];
    $(data).find("caption, thead, tbody, tfoot, tr, th, td").each(function() {
        var attributes = this.attributes;
        var i = attributes.length;
        while( i-- ) {
          var attr = attributes[i];
          if($.inArray(attr.name, attrWhiteList) == -1)
            this.removeAttributeNode(attr);
        }
    });

    $(".description").html('');
    $("#table-grabber-form").find("#txtTableCode").val("<table>" + data.html().trim().replace(/&nbsp;/gi,'') + "</table>");
    $("#txtTableCode").select();
    document.execCommand("Copy", false, null);
    $("#btnCopyTable").removeAttr("disabled");    
  });

  $(document).on('click', '#btnCopyTable', function () {
    $("#txtTableCode").select();
    document.execCommand("Copy", false, null);
    $("#table-grabber-form .jarvis-pop-close").click();
  });

  $(document).on('click', '#table-grabber-form .jarvis-pop-close', function () {
    $("#table-grabber-form").remove();
    $(".table-overlay").remove();
  });
})(window, $)