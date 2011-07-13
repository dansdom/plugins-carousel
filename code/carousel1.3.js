/*
	jQuery Carousel Plugin
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// version 1.1 - just a bit of optimisation of the code here, no functional changes
// version 1.2 - added new option to start at a nominated position
// version 1.3 - added option to declare a css selector for the scroll pane 
//   		   	 this will enable the HTML structure to be more flexible. If this value is false then HTML structure has to be precise

(function($){

	$.fn.carousel = function(config)
	{
		// config - default settings
		var settings = {
					   		'itemWidth' : 50, 		// item width
							'itemHeight' : 80,		// item height
				   	  		'scrollNext': '.next',	// class of the next button
							'scrollPrev': '.prev',	// class of the previous button
							'scrollPane': false,	// choose the name of the scrollPane - if false then walk the DOM
							'scrollSpeed': '1000',	// speed at which the carousel scrolls
							'scrollNum': 5,			// how many items the carousel scrolls
							'scrollVisible': 3,		// how many items are visible in the carousel
							'circular': false,		// will carousel scroll back to the beginning of the list when it is at the end
							'vertical': false,		// is the carousel vertical or horizontal scrolling?
							'startPoint': 0			// choose the scroll number which the carousel starts on, 0 is default (nothing), 1 is the first item
					 };

		// if settings have been defined then overwrite the default ones
		if (settings) $.extend({}, settings, config);  
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){

			// do pluging stuff here
			// *** declare object variables here: ***
			// each box calling the plugin now has the variable name: container
			var container = $(this);
			container.counter = 1;
			// allows user to set scrollPane
			if (settings.scrollPane)
			{
				container.scrollPane = $(settings.scrollPane);
			}
			else
			{
				container.scrollPane = container.children("div");
			}
			container.theList = container.scrollPane.children("ul");
			container.carouselSize = container.theList.children("li").size();
			// setup carousel tail before adding style and event handling
			if (settings.circular == true)
			{
				$.fn.carousel.addTail(container,settings);
			}
   			container.listItems = container.theList.children("li");
			container.itemWidth = settings.itemWidth;
			container.itemHeight = settings.itemHeight;

			container.scrollNum = settings.scrollNum;
			container.carouselWidth = container.carouselSize * container.itemWidth;
			container.carouselHeight = container.carouselSize * container.itemHeight;
            // set the scroll length based on height or width of list item
			if (settings.vertical == true)
			{
				container.itemDimension = container.itemHeight;
			}
			else
			{
				container.itemDimension = container.itemWidth;
			}
			container.scrollLength = container.scrollNum * container.itemDimension;

			container.scrollNext = $(settings.scrollNext);
			container.scrollPrev = $(settings.scrollPrev);
			container.scrollVisible = settings.scrollVisible;
			container.scrollPos = 0;


			//  *** stlye carousel ***
			$.fn.carousel.styleList(container,settings);
			
			// check start point and adjust accordingly
            $.fn.carousel.setStartPos(container,settings);
			
			//  *** check if carouselSize < scrollVisible, if so add event handling onto navigation
			// this must be on my to do list for now.........
			// **********************************************


			//  *** navigation functions here: ***
			$(settings.scrollNext).click(function(){
				//  *** find the left/top scroll position of the carousel ***
				$.fn.carousel.findScrollPos(container,settings,"next");
				//  *** find if at end position ***
				if (settings.circular == false)
				{
				    $.fn.carousel.findEndPos(container,settings,"next");
				}
				else
				{
					$.fn.carousel.findEndPosCircular(container,settings,"next");
				}
				//  *** animate ul to correct position ***
				$.fn.carousel.animateList(container,settings);
				// find next animation stop point
				container.animationEnd = container.scrollPos;
				return false;
			});

			$(settings.scrollPrev).click(function(){

				//  *** find the left/top scroll position of the carousel ***
				$.fn.carousel.findScrollPos(container,settings,"prev");

				//  *** find if at end position ***
				if (settings.circular == false)
				{
				    $.fn.carousel.findEndPos(container,settings,"prev");
				}
				else
				{
					$.fn.carousel.findEndPosCircular(container,settings,"prev");
				}

				//  *** animate ul to correct position ***
				$.fn.carousel.animateList(container,settings);
				// find next animation stop point
				container.animationEnd = container.scrollPos;
				return false;
			});
			/////////////////////////
			// end of plugin stuff //
			/////////////////////////
		});

		// return jQuery object
		return this;
	}

	/////////////////////////////////
	/////// private functions ///////
	/////////////////////////////////

	//////////////////////////////////////////////
	// set the start position of the carousel   //
	//////////////////////////////////////////////

	$.fn.carousel.setStartPos = function(container,settings)
	{
	 	if (settings.startPoint != 0)
		{
			// see if counter is larger than carouselSize and then set the actual starting position if carousel is circular
			if (Math.abs(settings.startPoint) > container.carouselSize && settings.circular == true)
			{
				// trim startPoint
				if (settings.startPoint > 0)
				{
	   			    var multiplier = Math.floor(settings.startPoint/container.carouselSize);
				   	var actualStart = settings.startPoint - (container.carouselSize*multiplier);
				}
				else
				{
					var multiplier = Math.ceil(settings.startPoint/container.carouselSize);
					var actualStart = (settings.startPoint - (container.carouselSize*multiplier)) + container.carouselSize;
				}
			}
			// if starting point is outside the range of a linear carousel
			else if ((settings.startPoint > container.carouselSize || settings.startPoint < 0) && settings.circular == false)
			{
				var actualStart = 1;
				//alert("starting position is outside the carousel range. Please set /'startPoint/' ");
			}
			// if its inside the range of the carousel
			else 
			{
				if (settings.startPoint > 0)
				{
					var actualStart = settings.startPoint;
				}
				else
				{
					var actualStart = settings.startPoint + container.carouselSize;
				}
			}
			

			// set new scrollPos
			container.counter = actualStart;
			// set the start position in pixels
			if (settings.circular == true)
			{
				var startPosition = ((container.counter+container.scrollVisible)*container.itemDimension) - container.itemDimension;
			}
			else
			{
				if (container.counter > (container.carouselSize - container.scrollVisible))
				{
					container.counter = container.carouselSize - container.scrollVisible + 1;
					$(settings.scrollNext).addClass("disabled");
				}
				if (container.counter > 1)
				{
					$(settings.scrollPrev).removeClass("disabled");
				}
			 	var startPosition = (container.counter*container.itemDimension) - container.itemDimension;
			}

			// set css position of the ul
			if (settings.vertical == true)
			{
				container.theList.css("top",-startPosition+"px");
			}
			else
			{
			 	container.theList.css("left",-startPosition+"px");
			}
			// set position variables for the carousel
			container.scrollPos = -startPosition;
			container.animationEnd = container.scrollPos;
		}
 	}

	////////////////////////////////////////////////
	// find where the carousel is scrolling to    //
	////////////////////////////////////////////////

	// find out whether carousel has reached the end
	$.fn.carousel.findEndPos = function(carousel,opts,direction)
	{
 	 	// forward motion
		if (direction == "next")
		{
			// check to see if carousel is going to scroll to the end of the list
		   	if (opts.scrollVisible + carousel.counter + carousel.scrollNum > carousel.carouselSize)
			{
				if (opts.vertical == false)
				{
					carousel.theList.css("left", carousel.animationEnd);
				}
			   	carousel.scrollPos = (opts.scrollVisible*carousel.itemDimension)-(carousel.carouselSize*carousel.itemDimension);
			 	$(opts.scrollNext).addClass("disabled");
			 	carousel.counter = (carousel.carouselSize - opts.scrollVisible) + 1;
	   		}
	   		// otherwise just scroll to the next position
	   		else
	   		{
	   		 	carousel.counter = carousel.counter + carousel.scrollNum;
	   		}
	   		$(opts.scrollPrev).removeClass("disabled");
		}
		// backward motion
		else
		{
			// see if carousel is going to scroll past the start
			if (carousel.counter <= carousel.scrollNum)
 			{
				carousel.scrollPos = 0;
			 	carousel.counter = 1;
             }
             // else scroll to the previous position
             else
             {
              	 carousel.counter = carousel.counter - carousel.scrollNum;
             }
             $(opts.scrollNext).removeClass("disabled");
             if (carousel.counter == 1)
             {
			 	$(opts.scrollPrev).addClass("disabled");
			 }
		}
	}

	// Find out if carousel movement is going into the tail if circular
	$.fn.carousel.findEndPosCircular = function(carousel,opts,direction)
	{
		if (direction == "next")
		{
			if ((carousel.counter + carousel.scrollNum) > carousel.carouselSize)
			{
				carousel.counter = carousel.counter - carousel.carouselSize;
			  	var resetPos = carousel.scrollPos + ((carousel.carouselSize+carousel.scrollNum)*carousel.itemDimension);
			  	carousel.scrollPos = resetPos - carousel.scrollLength;
			  	if (opts.vertical == false)
			  	{
					carousel.theList.css("left",resetPos);
				}
				else
				{
					carousel.theList.css("top",resetPos);
				}
			}
			carousel.counter = carousel.counter + carousel.scrollNum;
		}
		else
		{
			if (carousel.counter < 1)
			{
				carousel.counter = carousel.counter + carousel.carouselSize;
				var resetPos = carousel.scrollPos - ((carousel.carouselSize+carousel.scrollNum)*carousel.itemDimension);
				carousel.scrollPos = resetPos + carousel.scrollLength;
				if (opts.vertical == false)
				{
					carousel.theList.css("left",resetPos);
				}
				else
				{
					carousel.theList.css("top",resetPos);
				}
			}
			carousel.counter = carousel.counter - carousel.scrollNum;
		}
	}

	///////////////////////////////////////////////////////////
	// find carousel current position                        //
	///////////////////////////////////////////////////////////
	$.fn.carousel.findScrollPos = function(carousel,opts,direction)
	{
		if (opts.vertical == false)
		{
			// stop previous animtation running first
			carousel.theList.stop();
			carousel.theList.css("left", carousel.animationEnd);
  		    var leftPos = parseInt(carousel.theList.css("left"));
  		    if (direction == "next")
  		    {
		        carousel.scrollPos = leftPos - carousel.scrollLength;
		    }
			else
			{
				carousel.scrollPos = leftPos + carousel.scrollLength;
			}
		}
		else
		{
			// stop previous animtation running first
			carousel.theList.stop();
			carousel.theList.css("top", carousel.animationEnd);
		 	var topPos = parseInt(carousel.theList.css("top"));
		 	if (direction == "next")
		 	{
				carousel.scrollPos = topPos - carousel.scrollLength;
			}
			else
			{
				carousel.scrollPos = topPos + carousel.scrollLength;
			}
		}
	}

	/////////////////////////////////////////////////////////
	// animate carousel                                    //
	/////////////////////////////////////////////////////////
	$.fn.carousel.animateList = function(carousel,opts)
	{
		if (opts.vertical == false)
		{
		    carousel.theList.animate({left:carousel.scrollPos}, opts.scrollSpeed);
		}
		else
		{
			carousel.theList.animate({top:carousel.scrollPos}, opts.scrollSpeed);
		}
	}

	//////////////////////////////////////////////////////////
	// if carousel is circular then add the tail to it      //
	//////////////////////////////////////////////////////////
	$.fn.carousel.addTail = function(carousel,opts)
	{
		for (i=0;i<opts.scrollVisible;i++)
		{
			lastIndex = "li:eq("+(carousel.carouselSize-1)+")";
			firstIndex = "li:eq("+(i*2)+")";
			appendage = carousel.theList.children(firstIndex).clone();
			prependage = carousel.theList.children(lastIndex).clone();
			appendage.appendTo(carousel.theList);
			prependage.prependTo(carousel.theList);
		}
	}

	///////////////////////////////////////////////////
	// add css to the carousel                       //
	///////////////////////////////////////////////////
	$.fn.carousel.styleList = function(carousel,opts)
	{
		// style elements in the carousel
		carousel.css({position:"relative"})
		carousel.scrollPane.css({position:"relative", left:"0px", overflow:"hidden","z-index":"2"});
		carousel.theList.css({"list-style-type":"none", margin:"0px", padding:"0px", position:"relative", "z-index":"1", height:carousel.carouselHeight+"px", width:carousel.itemWidth+"px", left:"0px", top:"0px"});
		carousel.listItems.css({cssFloat:"left", overflow:"hidden", display:"block", height: carousel.itemHeight+"px", width:carousel.itemWidth+"px"});
		carouselWidth = carousel.listItems * carousel.scrollVisible;

		if (opts.vertical == true)
		{
		    // do css on carousel elements
			carousel.scrollPane.css({height:carousel.itemHeight*carousel.scrollVisible+"px", width:carousel.itemWidth+"px"});
			carousel.theList.css({height:carousel.carouselHeight+"px", width:carousel.itemWidth+"px"});
			// if circular then correct height and position for the tail
			if (opts.circular == true)
			{
				carousel.theList.css({top: 0 - (carousel.scrollVisible*carousel.itemHeight) +"px", height: carousel.carouselHeight+(carousel.scrollVisible*carousel.itemHeight*2)+"px"});
			}
			// define the end of the animation to stop multiple animations running at once
			carousel.animationEnd = carousel.theList.css("top");
		}
		else
		{
			carousel.scrollPane.css({height:carousel.itemHeight,width:carousel.itemWidth*carousel.scrollVisible+"px"});
			carousel.theList.css({height:carousel.itemHeight+"px", width:carousel.carouselWidth+"px"});
			// if circular then correct width and position for the tail
			if (opts.circular == true)
			{
				carousel.theList.css({left: 0 - (carousel.scrollVisible*carousel.itemWidth) +"px", width: carousel.carouselWidth+(carousel.scrollVisible*carousel.itemWidth*2)+"px"});
			}
			// define the end of the animation to stop multiple animations running at once
			carousel.animationEnd = carousel.theList.css("left");
		}
		if (opts.circular == false)
		{
			$(carousel.scrollPrev).addClass("disabled");
		}
		// carousel now styled!!!
	}

	function debug(variable,val)
	{
		val = val.toString();
		variable = "."+variable
		$(variable).children("p").html(val);
	}
	// end of module
})(jQuery); 


// call plugin when DOM is loaded - calling this from the HTML for the time being
//$(document).ready(function(){
//	$(".myCarousel").carousel({});
//});