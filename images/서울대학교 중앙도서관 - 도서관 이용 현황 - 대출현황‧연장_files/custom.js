(function () {
    "use strict";
    'use strict';

	var jq = document.createElement("script");
	jq.src = "//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
	document.getElementsByTagName("head")[0].appendChild(jq);
	
    var app = angular.module('viewCustom', ['angularLoad']);

    /****************************************************************************************************/

        /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

        /*var app = angular.module('centralCustom', ['angularLoad']);*/

    /****************************************************************************************************/


	
	// adds the top bar depending on with language page are we on
	// adds the top bar after on "prmTopbarAfter" directive

	if(window.location.href.indexOf("en_US") > -1) {
		app.component('prmTopbarAfter', {
			bindings: { parentCtrl: '<' },
			templateUrl: 'custom/82SNU/html/TopBarEnglish.html'
		});
	}
	else{
		app.component('prmTopbarAfter', {
			bindings: { parentCtrl: '<' },
			templateUrl: 'custom/82SNU/html/TopBarKorean.html'
		});
	}

	//every time url changes this happens
	app.run(function($rootScope) {
		/*$rootScope.$on("$viewContentLoaded", function(event, next, current) { 
			alert("yo1");
			$rootScope.changeLanguage = function(){
				alert("yo2");
				alert($rootScope.selectedLanguage);
			}
			alert($rootScope.selectedLanguage); //undefined
		});*/
		
		$rootScope.$on("$locationChangeStart", function(event, next, current) { 
			//checks if the last url is different language than the current one. 
			var trigger = setInterval(function() {

				
				if(window.location.href.indexOf("ko_KR") == -1 && window.location.href.indexOf("en_US") == -1){
					clearInterval(trigger);
				}
				else if(document.getElementById('myTopnav_kor') != null || document.getElementById('myTopnav_eng') != null){
					if (document.getElementById('myTopnav_kor') != null &&  window.location.href.indexOf("ko_KR") <= -1
						|| document.getElementById('myTopnav_eng') != null &&  window.location.href.indexOf("en_US") <= -1) {
							location.reload();
					}
					clearInterval(trigger);
				}
			}, 1000);

		});
	});

	app.controller('customSmsCtrl', ['$window', '$stateParams', function($window, $stateParams) {
        var vm = this;

        this.$onInit = function(){
          {
            vm.sendSMS = function () {
                if(vm.parentCtrl.item){
                    var recordId= vm.parentCtrl.item.pnx.control.recordid[0];
                    var url = '/primo_library/libweb/pushToAction?recId='+ recordId;
                    url += "&docs=" + recordId;
                    url += "&doc=" + recordId;
                    url += '&pushToType=SmsSend&fromEshelf=false';
                    url += '&vid=82SNU';
                    $window.open(url, '_blank');
                }
                
            };
          }
        };
    }]);

	app.component('customSms', {
		bindings: { parentCtrl: '<' },
		controller: 'customSmsCtrl',
		controllerAs: 'vm',
		templateUrl: 'custom/82SNU/html/custom-sms.html'
	});
	  
  /**
	* Created by jhan on 12/24/2018.
	* Last Updated 3/28/2019
	* This component will insert textsms and its icon into the action list in primo full display page
	*/
	app.controller('prmActionListAfterCtrl', ['$element', '$compile', '$scope', '$timeout', function ($element, $compile, $scope, $timeout) {
		var vm = this;
		vm.$onInit = function () {
			if (!vm.parentCtrl.displaymode) {
				$timeout(function () {
					// if holding location is existed, then insert sms text call icon
					if (vm.parentCtrl.item.delivery) {
						if (vm.parentCtrl.item.delivery.holding.length > 0) {
							var prmActionList_array = document.getElementsByTagName('prm-action-list');
							for(var i=0;i < prmActionList_array.length;i++){
								var prmActionList = prmActionList_array[i];
								//console.log("=>Prm-action-list");
								//console.log(prmActionList);
								if(prmActionList){
									var smsTagName="custom-sms";
									var textSmsElement = prmActionList.getElementsByTagName(smsTagName);
									//console.log("=>textSmsElement");
									//console.log(textSmsElement)
									if (textSmsElement.length < 1) {
										var ul = prmActionList.getElementsByTagName('ul')[0];
										var div = ul.querySelector('#scrollActionList');
										console.log("=>scrollActionList div")
										console.log(div);
										if (div) {
											var smsTag = document.createElement(smsTagName);
											smsTag.setAttribute('parent-ctrl', 'vm.parentCtrl');
											div.insertBefore(smsTag, div.childNodes[0]);
											$compile(div.children[0])($scope);
										}
									}
								}
								
							} //end for for
																	
						}
					}

				}, 0); 
			}
		};
	}]);

	app.component('prmActionListAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmActionListAfterCtrl',
		controllerAs: 'vm'
	});
	
	/**
	* Created by Jangho on 06/29/2019.
	* Last Updated 06/29/2019
	* This component will change the attributes of creator to make 'contains' search possible when clicking 'author' name
	*/
	app.controller('prmServiceDetailsAfterCtrl', ['$element', '$compile', '$scope', '$timeout', function ($element, $compile, $scope, $timeout) {
		var vm = this;
		vm.$onInit = function () {
			if (typeof vm.parentCtrl._details!=='undefined'){
				vm.parentCtrl._details.forEach(function(item, index, arr) {
					if(arr[index].label =='creator')
					{
						arr[index].values.forEach(function(item2, index2, arr2){
						if(arr2[index2].key=='creator'&&arr2[index2].operator=='exact')
							arr2[index2].operator='contains'
						});
					}
					/**
					* Created by Jangho on 10/14/2019.
					* Last Updated 10/14/2019
					* This component will remove the description field having 'dcterms:tableOfContents' if the type of record is '의학자료'
					*/
					if(arr[index].label =='description')
					{
						var needToRemove='';
						var source='';
						arr[index].values.forEach(function(item2, index2, arr2){
							arr2[index2].values.forEach(function(item3, index3, arr3){
								if(arr3[index3].indexOf('NeedToRemoveStart-')!=-1 && arr3[index3].indexOf('-NeedToRemoveEnd')!=-1)
								{
									source=arr3[index3];
									source=source.replace('NeedToRemoveStart-','');
									source=source.replace('-NeedToRemoveEnd','');
									needToRemove=source;
									arr3.splice(index3,1);
								}
								if(needToRemove!='')
								{
									for(var i = arr3.length - 1; i >= 0; i--) {
										if(arr3[i] === needToRemove) {
										   arr3.splice(i, 1);
										}
									}
								}
							});
						});
					}
				});
			}
		};
	}]);
	/**
	* Created by Jangho on 08/07/2019.
	* Last Updated 08/07/2019
	* Case 00585250: SNU wants to export RIS file in their desirable way.
	*/
	app.component('prmServiceDetailsAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmServiceDetailsAfterCtrl',
		controllerAs: 'vm'
	});
	
	app.controller('prmExportRisAfterCtrl', ['$element', '$compile', '$scope', '$timeout', function ($element, $compile, $scope, $timeout) {
		var vm = this;
		vm.$onInit = function () {
			if (typeof vm.parentCtrl.item.pnx.display.lds53!=='undefined'){
				var desirableTitle=vm.parentCtrl.item.pnx.display.lds53[0];
				if(desirableTitle!=='')
				{
					vm.parentCtrl.item.pnx.display.title[0]=desirableTitle;
				}
			}
			if (typeof vm.parentCtrl.item.pnx.display.lds51=='undefined'){
				var recordID=vm.parentCtrl.item.pnx.control.recordid[0];
				if(recordID!=='')
				{
					vm.parentCtrl.item.pnx.display.lds51=[];
					vm.parentCtrl.item.pnx.display.lds51.push("http://snu-primo.hosted.exlibrisgroup.com/82SNU:"+recordID);
				}
			}
			var risType='';
			var finalRisType='';

			risType=vm.parentCtrl.item.pnx.display.type[0];

			if(risType!='')
			{
				switch(risType.toLowerCase())
				{
					case 'dvd':
						finalRisType='Film or Broadcast';
					break;
					case 'cd':
						finalRisType='Audiovisual Material';
					break;
					case 'album':
						finalRisType='Audiovisual Material';
					break;
					case 'vhs':
						finalRisType='Film or Broadcast';
					break;
					case 'book':
						finalRisType='Electronic Book';
					break;
					case 'database':
						finalRisType='Online Database';
					break;
					case 'e-journal':
						finalRisType='Serial';
					break;
					case 'journal':
						finalRisType='Serial';
					break;
					case 'conference_proceedings':
					case 'conference proceedings':
						finalRisType='Conference Proceedings';
					break;
					case 'image':
						finalRisType='Figure';
					break;
					case 'website':
						finalRisType='Web Page';
					break;
					case 'article':
						finalRisType='Journal Article';
					break;
					case 'video':
						finalRisType='Audiovisual Material';
					break;
					case 'text_resource':
					case 'text resource':
						finalRisType='Report';
					break;
					case 'other':
						finalRisType='Generic';
					break;
					case 'rare_book':
					case 'rare book':
						finalRisType='Book';
					break;
					case 'dissertation':
						finalRisType='Thesis';
					break;		
					case 'audio':
						finalRisType='Audiovisual Material';
					break;	
					case 'dissertation':
						finalRisType='Thesis';
					break;	
					case 'map':
						finalRisType='Map';
					break;	
					case 'score':
						finalRisType='Music';
					break;	
					case 'print_book':
					case 'print book':
						finalRisType='Book';
					break;	
					case 'book_chapters':
					case 'book chapters':
					case 'book_chapter':
					case 'book chapter':
						finalRisType='Book Section';
					break;	
					case 'patents':
					case 'patent':
						finalRisType='Patent';
					break;	
					case 'newspaper_article':
					case 'newspaper article':
						finalRisType='Newspaper Article';
					break;
					case 'audio_visual':
					case 'audio visual':
						finalRisType='Audiovisual Material';
					break;
					case 'review':
						finalRisType='Journal Article';
					break;
					case 'reference_entry':
					case 'reference entry':
					case 'reference entries':
						finalRisType='Book Section';
					break;
					case 'research_dataset':
					case 'research dataset':
						finalRisType='Dataset';
					break;
					case 'statistical_data_set':
					case 'statistical data set':
						finalRisType='Dataset';
					break;		
					case 'technical_report':
					case 'technical report':
						finalRisType='Report';
					break;	
					case 'dissertations':
						finalRisType='Thesis';
					break;	
					default:
						finalRisType='Generic';						
				}
				if (typeof vm.parentCtrl.item.pnx.addata.ristype=='undefined')
				{
					vm.parentCtrl.item.pnx.addata.ristype=[];
					vm.parentCtrl.item.pnx.addata.ristype.push(finalRisType);
				}
				else
				{
					vm.parentCtrl.item.pnx.addata.ristype[0]=finalRisType;
				}
			}
			//vm.parentCtrl.item.pnx.display.title[0]=vm.parentCtrl.item.pnx.display.title[0].replace(" ; "," : ");
		};
	}]);
	
	app.component('prmExportRisAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmExportRisAfterCtrl',
		controllerAs: 'vm'
	});
/*	
	app.controller('prmSearchResultAvailabilityLineAfterCtrl', ['$element', '$compile', '$scope', '$timeout', function ($element, $compile, $scope, $timeout) {
		var vm = this;
		vm.$onInit = function () {

		};
	}]);
	app.component('prmSearchResultAvailabilityLineAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmSearchResultAvailabilityLineAfterCtrl',
		controllerAs: 'vm'
	});	
	*/
	/* Fric Start */
	app.config(function($sceDelegateProvider) {  
	
		$sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self',
		// Allow loading from our assets domain. **.
		'https://exlibriskorea.com/**',
		'https://proxy-ap.hosted.exlibrisgroup.com/**'
		]);
	});
  
	app.controller('prmBriefResultContainerAfterCtrl', ['$element', '$compile', '$scope', '$timeout','$http', function ($element, $compile, $scope, $timeout,$http) {
		var vm = this;
		vm.$onInit = function () {
				$timeout(function () {
					var ISSN;
					var title;
					var atitle;
					var fricPhp;
					var URL;
					if (typeof vm.parentCtrl.item.pnx.delivery.fulltext!='undefined'&& vm.parentCtrl.item.pnx.addata.genre!=null)
					{
						if (typeof vm.parentCtrl.item.pnx.delivery.fulltext[0]!='undefined'&& vm.parentCtrl.item.pnx.addata.genre[0]!=null)
						{
							if (vm.parentCtrl.item.pnx.delivery.fulltext[0]=="no_fulltext"&& vm.parentCtrl.item.pnx.addata.genre[0]=="article")
							{

								URL = location.hostname;
								fricPhp="https://exlibriskorea.com/apps/fric/get_fric.php";
								
								if (typeof vm.parentCtrl.item.pnx.addata.atitle!='undefined' || vm.parentCtrl.item.pnx.addata.atitle!= null)
								{
									if (typeof vm.parentCtrl.item.pnx.addata.atitle[0]!='undefined' || vm.parentCtrl.item.pnx.addata.atitle[0]!= null)
									{
										atitle=vm.parentCtrl.item.pnx.addata.atitle[0];
										atitle=atitle.trim();
									}
								}
								if (typeof vm.parentCtrl.item.pnx.addata.jtitle!='undefined' || vm.parentCtrl.item.pnx.addata.jtitle!= null)
								{
									if (typeof vm.parentCtrl.item.pnx.addata.jtitle[0]!='undefined' || vm.parentCtrl.item.pnx.addata.jtitle[0]!= null)
									{
										title=vm.parentCtrl.item.pnx.addata.jtitle[0];
										title=title.trim();
									}
								}
								if (typeof vm.parentCtrl.item.pnx.addata.issn!='undefined' || vm.parentCtrl.item.pnx.addata.issn!= null)
								{
									if (typeof vm.parentCtrl.item.pnx.addata.issn[0]!='undefined' || vm.parentCtrl.item.pnx.addata.issn[0]!= null)
									{
										ISSN=vm.parentCtrl.item.pnx.addata.issn[0];
										ISSN=ISSN.trim();
									}
								}
														
								var hostURL=URL.split(".");
								var libHash="SNU";
								

								if(atitle.length==0)
									return;
								else
								{	
									fricPhp=fricPhp+'/?'+'rft.atitle='+atitle;
									
									if (ISSN.length>0)
										fricPhp=fricPhp+'&rft.issn='+ISSN;
										
									if (title.length>0)
										fricPhp=fricPhp+'&rft.title='+title;
								}
								
								fricPhp=fricPhp+"&hash="+libHash;
								fricPhp=fricPhp;
								$http.jsonp(fricPhp, {jsonpCallbackParam: 'callback'}).then(function(responses){
									$scope.myData = responses.data;
								});
		/*
								$http.jsonp(fricPhp).success(function (responses){
									$scope.myData = responses;
								});
								*/
								setTimeout(function(){
									$('button#briefResultMoreOptionsButton').click(function(){
										$(this).closest('.list-item').find("#fricContainer").toggle();
									});
									$('.list-item button.prm-primary').click(function(){
										$(this).closest('.list-item').find("#fricContainer").toggle();
									})
									
									
								},4000);
							}
						}
					}
				}, 0); 
		};
	}]);

	app.filter('removeHTMLTags', function() {
		return function(text) {
			return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
		};
	});
	
	
	app.component('prmBriefResultContainerAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmBriefResultContainerAfterCtrl',
		controllerAs: 'vm',
		template: '<div id="fricContainer"><div id="fricItem" ng-repeat="x in myData"><a style="color: grey" target="_blank" href="{{x.url}}"><md-icon><svg id="link" width="100%" height="100%" viewBox="0 0 24 24" y="528" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\
        <path d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z"></path>\
    </svg></md-icon>RISS에서 무료 원문복사 신청하기 </a><br ng-if="$first">\</div></div>'
	});
	/* Fric End */

	angular.module('googleAnalytics', []);
	angular.module('googleAnalytics').run(function ($rootScope, $interval, analyticsOptions) {
		if(analyticsOptions.hasOwnProperty("enabled") && analyticsOptions.enabled) {
			if(analyticsOptions.hasOwnProperty("siteId") && analyticsOptions.siteId != '') {
				if(typeof ga === 'undefined') {
					(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
					(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
					m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
					})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	
					ga('create', analyticsOptions.siteId, {'alwaysSendReferrer': true});
					ga('set', 'anonymizeIp', true);
				}
			}
			$rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
				if(analyticsOptions.hasOwnProperty("defaultTitle")) {
					var documentTitle = analyticsOptions.defaultTitle;
					var interval = $interval(function () {
						if(document.title !== '') documentTitle = document.title;
						if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1)
							if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;
							else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();
						
						if(typeof ga !== 'undefined') {
							if(fromState != toState) ga('set', 'referrer', fromState);
							ga('set', 'location', toState);
							ga('set', 'title', documentTitle);
							ga('send', 'pageview');
						}
						$interval.cancel(interval);
					}, 0);
				}
			});
		}
	});
	angular.module('googleAnalytics').value('analyticsOptions', {
		enabled: true,
		siteId: 'G-PCW3JL68KR',
		defaultTitle: 'Discovery Search'
	});


})();

//START - Google Analytics

var googleAnalyticsUrl = document.createElement('script');
googleAnalyticsUrl.src = "https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.googletagmanager.com%2Fgtag%2Fjs%3Fid%3DG-XXXXXXXXXX&amp;data=05%7C01%7C%7Cf62904211d394c23e4dd08da8e101a28%7C31d7e2a5bdd8414e9e97bea998ebdfe1%7C0%7C0%7C637978497052734443%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&amp;sdata=hro6lebULevd%2B6NJkMeZEZDb6M6%2FdkUDMAO%2B1Kfioao%3D&amp;reserved=0";
googleAnalyticsUrl.type = 'text/javascript';
googleAnalyticsUrl.async = true;
document.head.appendChild(googleAnalyticsUrl);

var googleAnalyticsCode = document.createElement('script');
googleAnalyticsCode.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PCW3JL68KR');`;
document.head.appendChild(googleAnalyticsCode);   

//END - Google Analytics   
