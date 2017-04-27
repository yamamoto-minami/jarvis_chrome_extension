(function(window, jQuery){
    
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

		switch (request.msg) {

            // Profile...
			case "GetProfile":
				var profile = JSON.parse(localStorage.getItem('jarvisSiteProfile'));
                sendResponse(profile);
                return true;
				break;
            case "SaveProfile":
                var data = request.data;
                localStorage.setItem('jarvisSiteProfile', JSON.stringify(data));
                sendResponse();
                return true;
                break;

            // Stub/Quick Article...
            case "GetStubArticle":
				var stubArticle = JSON.parse(localStorage.getItem('jarvisStubArticle'));
                sendResponse(stubArticle);
                return true;
				break;
            case "RemoveStubArticle":
                localStorage.removeItem('jarvisStubArticle');
                sendResponse();
                return true;
                break;

            // Auto-Save Article...
            case "AutoSaveArticle":
                var autoSaveArticle = request.data;
                localStorage.setItem('jarvisAutoSaveArticle', JSON.stringify(autoSaveArticle));
                sendResponse();
                return true;
                break;
            case "GetAutoSaveArticle":
				var autoSaveArticle = JSON.parse(localStorage.getItem('jarvisAutoSaveArticle'));
                sendResponse(autoSaveArticle);
                return true;
				break;
            case "GetAutoSaveCloneArticle":
                var autoSaveCloneArticle = JSON.parse(localStorage.getItem('jarvisAutoSaveArticleClone'));
                sendResponse(autoSaveCloneArticle);
                return true;
                break;
            case "RemoveAutoSaveCloneArticle":
                localStorage.removeItem('jarvisAutoSaveArticleClone');
                sendResponse();
                return true;
                break;
                
			default:
				console.log("Unknown request was found.");
				break;
		}
	});
})(window, $);