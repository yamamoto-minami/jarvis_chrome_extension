(function(window, jQuery){
  var profile = {};
  var last_article = {};
  
	chrome.extension.sendMessage({
    msg: 'GetProfile'
  }, function(response){
    if(response == null){
      var url = chrome.extension.getURL('../assets/html/profile_selection_page.html');
      $("div.container").load(url);
    } else {
      profile = response;
      var url = chrome.extension.getURL('../assets/html/main.html');
      $("div.container").load(url, function(){
        ShowPanel();
      });
    }
  });
  
  $(document).on('change', '#profiles', function(){
    $("#save_profile").removeAttr('disabled');  
  });
  
  $(document).on('click', '#save_profile',function(){
    var index = parseInt($("#profiles").val());
    $.getJSON("../js/profiles.json", function(response){
      var profiles = response.profiles;
      var selected_profile = profiles[index];
      chrome.extension.sendMessage({
        msg: 'SaveProfile',
        data: selected_profile
      }, function(response){
        profile = selected_profile;
        var url = chrome.extension.getURL('../assets/html/main.html');
        $("div.container").load(url, function(){
          ShowPanel();
        });
      });
    }, function(error){});
  });
  
  $(document).on('click', ".main-panel .switch-site", function(){
    var url = chrome.extension.getURL('../assets/html/profile_selection_page.html');
    $("div.container").load(url, function(){
      $(".wrapper").css('height', '380px');
    });
  });
  
  $(document).on('click', ".amazon-link", function(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "GetCurrentTabUrl"},function(response){
        var url = chrome.extension.getURL('../assets/html/getamazonlink.html');
        $("div.main-content").load(url, function(){
          $(".wrapper").css('height', '250px');
          if(response != null){
            if(response.indexOf("amazon.com") > -1){
              $(".link-input").hide();
              
              var amazon_link = response;
              if (amazon_link.indexOf("?") == -1) {
                amazon_link += "?";
              }
              if (amazon_link.indexOf("_encoding") == -1) {
                amazon_link += "&_encoding=UTF8";
              }
              if (amazon_link.indexOf("linkCode=") == -1) {
                amazon_link += "&linkCode=ur2";
              }
              amazon_link += "&tag=" + profile.AMAZON_AFFILIATE_ID;

              $(".generated-result").show();
              $("#txtAmazonLink").val(amazon_link);
            }   
          }
        });      
      });
    });
  });
  
  $(document).on('click', ".fanatics-link", function(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "GetCurrentTabUrl"},function(response){
        console.log(response);
        var url = chrome.extension.getURL('../assets/html/getfanaticslink.html');
        $("div.main-content").load(url, function(){
          $(".wrapper").css('height', '250px');
          if(response != null){
            if(response.indexOf("fanatics.com") > -1){
              $(".link-input").hide();
              var fanatics_link = "http://www.avantlink.com/click.php?tt=cl&mi=11081&pw=" + profile.FANATICS_AFFILIATE_ID + "&ctc=jarvis&url=" + response;
              $(".generated-result").show();
              $("#txtFanaticsLink").val(fanatics_link);
            }   
          }
        });      
      });
    });
  });

  $(document).on('click', ".homage-link", function(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "GetCurrentTabUrl"},function(response){
        console.log(response);
        var url = chrome.extension.getURL('../assets/html/gethomagelink.html');
        $("div.main-content").load(url, function(){
          $(".wrapper").css('height', '250px');
          if(response != null){
            if(response.indexOf("homage.com") > -1){
              $(".link-input").hide();
              var homage_link = "http://www.avantlink.com/click.php?tt=cl&mi=14687&pw=" + profile.HOMAGE_AFFILIATE_ID + "&ctc=jarvis&url=" + response;
              $(".generated-result").show();
              $("#txtHomageLink").val(homage_link);
            }   
          }
        });      
      });
    });
  });

  $(document).on('keyup', '#txtAmazonInputUrl', function() {
    var val = $(this).val();
    if (val.length > 10) {
      $('.generate-amazon-link').removeAttr('disabled');
    } else {
      $('.generate-amazon-link').attr('disabled', 'disabled');
    }
  });

  $(document).on('keyup', '#txtFanaticsInputUrl', function() {
    var val = $(this).val();
    if (val.length > 10) {
      $('.generate-fanatics-link').removeAttr('disabled');
    } else {
      $('.generate-fanatics-link').attr('disabled', 'disabled');
    }
  });

  $(document).on('keyup', '#txtHomageInputUrl', function() {
    var val = $(this).val();
    if (val.length > 10) {
      $('.generate-homage-link').removeAttr('disabled');
    } else {
      $('.generate-homage-link').attr('disabled', 'disabled');
    }
  });

  $(document).on('click', '.generate-amazon-link', function() {
    var link = $("#txtAmazonInputUrl").val();
    
    var amazon_link = link;
    if (amazon_link.indexOf("?") == -1) {
      amazon_link += "?";
    }
    if (amazon_link.indexOf("_encoding") == -1) {
      amazon_link += "&_encoding=UTF8";
    }
    if (amazon_link.indexOf("linkCode=") == -1) {
      amazon_link += "&linkCode=ur2";
    }
    amazon_link += "&tag=" + profile.AMAZON_AFFILIATE_ID;
    
    $(".link-input").hide();
    $(".generated-result").show();
    
    $("#txtAmazonLink").val(amazon_link);
    $("#txtAmazonLink").select();
    document.execCommand("Copy", false, null);
  });

  $(document).on('click', '.generate-fanatics-link', function() {
    var link = $("#txtFanaticsInputUrl").val();
    var fanatics_link = "http://www.avantlink.com/click.php?tt=cl&mi=11081&pw=" + profile.FANATICS_AFFILIATE_ID + "&ctc=jarvis&url=" + link;
    
    $(".link-input").hide();
    $(".generated-result").show();
    
    $("#txtFanaticsLink").val(fanatics_link);
    $("#txtFanaticsLink").select();
    document.execCommand("Copy", false, null);
  });
  
  $(document).on('click', '.generate-homage-link', function() {
    var link = $("#txtHomageInputUrl").val();
    
    var homage_link = "http://www.avantlink.com/click.php?tt=cl&mi=11081&pw=" + profile.HOMAGE_AFFILIATE_ID + "&ctc=jarvis&url=" + link;
    
    $(".link-input").hide();
    $(".generated-result").show();
    
    $("#txtHomageLink").val(homage_link);
    $("#txtHomageLink").select();
    document.execCommand("Copy", false, null);
  });

  $(document).on('click', '#btnCopyAmazonLink', function() {
    $("#txtAmazonLink").select();
    document.execCommand("Copy", false, null);
    $(this).attr('disabled', 'disabled');
    $(this).html('Copied!');
  });

  $(document).on('click', '#btnCopyFanaticsLink', function() {
    $("#txtFanaticsLink").select();
    document.execCommand("Copy", false, null);
    $(this).attr('disabled', 'disabled');
    $(this).html('Copied!');
  });

  $(document).on('click', '#btnCopyHomageLink', function() {
    $("#txtHomageLink").select();
    document.execCommand("Copy", false, null);
    $(this).attr('disabled', 'disabled');
    $(this).html('Copied!');
  });
  
  $(document).on('click', '.quick-publish', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {action: 'CreateStubArticle'}, function(response) {
         localStorage.setItem('jarvisStubArticle', JSON.stringify(response));
         window.open(profile.ARTICLE_EDIT_URL, '_blank');
       });
    });
  });
  
  $(document).on('click', '.auto-save-restore', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "GetCurrentTabUrl"}, function(response) {
        if(response != undefined){
          if((response.indexOf(profile.ARTICLE_EDIT_URL) > -1) || (checkEditPage(response, profile.SITE_URL))) {
            var autoSaveArticle = JSON.parse(localStorage.getItem('jarvisAutoSaveArticle'));
            chrome.tabs.sendMessage(activeTab.id, {"action": "RestoreAutoSaveArticle", data: autoSaveArticle}, function(response){
              window.close();
            });
          } else {
            var autoSaveArticle = localStorage.getItem('jarvisAutoSaveArticle');
            localStorage.setItem("jarvisAutoSaveArticleClone", autoSaveArticle);
            if(JSON.parse(autoSaveArticle).url == undefined){
              window.open(profile.ARTICLE_EDIT_URL, '_blank');
            } else {
              window.open(JSON.parse(autoSaveArticle).url, '_blank');
            }         
          }
        } else {
          var autoSaveArticle = localStorage.getItem('jarvisAutoSaveArticle');
          localStorage.setItem("jarvisAutoSaveArticleClone", autoSaveArticle);
          if(JSON.parse(autoSaveArticle).url == undefined){
            window.open(profile.ARTICLE_EDIT_URL, '_blank');
          } else {
            window.open(JSON.parse(autoSaveArticle).url, '_blank');
          }
        }
      });
    });
  });
  

  $(document).on('click', '.grab-table', function () {
    chrome.tabs.query({currentWindow: true , active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"action": "GrabTable"}, function (response) {
        window.close();
      });
    })
  });

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

  function ShowPanel(){
    var article = localStorage.getItem('jarvisAutoSaveArticle');
    var profile = JSON.parse(localStorage.getItem('jarvisSiteProfile'));
    var title = profile.TITLE;
        
    $(".profile-title").html(title);
    
    if(article == null){
      $(".auto-save-restore").hide();
    } else {
      var isEmptyArticle = true;
      article = JSON.parse(article);
      
      Object.keys(article).forEach(function (property) {
        if (article[property] != '') {
          isEmptyArticle = false;
        }
      });
      
      if(isEmptyArticle){
        $(".auto-save-restore").hide();
      } else {
        var article_title = article.title;
        if(article_title.length > 42){
          article_title = article_title.slice(0,41).trim() + '...';
        }
        $(".main-panel .article-title").html(article_title);
      }
    }
  };
})(window, $);