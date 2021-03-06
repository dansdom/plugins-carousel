/*
	jQuery Carousel Plugin
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

(function($){

	$.fn.carousel = function(config)
	{
		// config - default settings
		var settings = {
					   		'itemWidth' : 50,
							'itemHeight' : 80,
				   	  		'scrollNext': '.next',
							'scrollPrev': '.prev',
							'scrollSpeed': '1000',
							'scrollNum': 5,
							'scrollVisible': 3,
							'circular': false,
							'vertical': false
					 };

		// if settings have been defined then overwrite the default ones
		if (settings) $.extend(settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){

			// do pluging stuff here
			// *** declare object variables here: ***
			// each box calling the plugin now has the variable name: container
			var container = $(this);
			container.counter = 1;
			container.scrollPane = container.children("div");
			container.theList = container.children("div").children("ul");
			container.carouselSize = container.theList.children("li").size();
			// setup carousel tail before adding style and event handling
			if (settings.circular == true)
			{
				$.fn.carousel.addTail(container,settings);
			}
   			container.listItems = container.children("div").children("ul").children("li");
   			// not sure which one to do: css or parameter declared width and height.... going with parameter
			//container.itemWidth = container.listItems.width();
			//container.itemHeight = container.listItems.height();
			container.itemWidth = settings.itemWidth;
			container.itemHeight = settings.itemHeight;

			container.scrollNum = settings.scrollNum;
			container.carouselWidth = container.carouselSize * container.itemWidth;
			container.carouselHeight = container.carouselSize * container.itemHeight;
			// set the scroll length based on height or width of list item
			if (settings.vertical == true)
			{
			    container.scrollLength = container.scrollNum * container.itemHeight;
			}
			else
			{
				container.scrollLength = container.scrollNum * container.itemWidth;
			}
			container.scrollNext = $(settings.scrollNext);
			container.scrollPrev = $(settings.scrollPrev);
			container.scrollVisible = settings.scrollVisible;
			container.scrollPos = 0;

			//  *** stlye carousel ***
			$.fn.carousel.styleList(container,settings);

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
					carousel.scrollPos = (opts.scrollVisible*carousel.itemWidth)-(carousel.carouselSize*carousel.itemWidth);
				}
				else
				{
			   		carousel.scrollPos = (opts.scrollVisible*carousel.itemHeight)-(carousel.carouselSize*carousel.itemHeight);
			 	}
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
				if (opts.vertical == false)
				{
					carousel.scrollPos = 0;
				}
				else
				{
			 		carousel.scrollPos = 0;
			 	}
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
		// forward motion
		if (direction == "next")
		{
			// console.log("BEFORE LOOP - size: "+carousel.carouselSize+", counter: "+carousel.counter);
			// horizontal -->
		   if (opts.vertical == false)
		   {
		   	  // check whether carousel is in the tail
		   	  if ((carousel.counter + carousel.scrollNum) > carousel.carouselSize)
	       	  {
			  	  carousel.counter = carousel.counter - carousel.carouselSize;
			  	  var resetPos = carousel.scrollPos + ((carousel.carouselSize+carousel.scrollNum)*carousel.itemWidth);
			  	  carousel.scrollPos = resetPos - carousel.scrollLength;
			  	  carousel.theList.css("left",resetPos);
   	 		  }
		   }
		   // vertical -->
		   else
		   {
		   	   // check whether carousel is in the tail
		   	   if ((carousel.counter + carousel.scrollNum) > carousel.carouselSize)
		   	   {
			   	   carousel.counter = carousel.counter - carousel.carouselSize;
			  	   var resetPos = carousel.scrollPos + ((carousel.carouselSize+carousel.scrollNum)*carousel.itemHeight);
			  	   carousel.scrollPos = resetPos - carousel.scrollLength;
			  	   carousel.theList.css("top",resetPos);
			    }
		   }
		   carousel.counter = carousel.counter + carousel.scrollNum;
		   // console.log("AFTER LOOP - size: "+carousel.carouselSize+", counter: "+carousel.counter);
		}
		// backward motion
		else
		{
			// console.log("BEFORE LOOP - size: "+carousel.carouselSize+", counter: "+carousel.counter);
			// horizontal <--
			if (opts.vertical == false)
			{
				if (carousel.counter < 1)
				{
					carousel.counter = carousel.counter + carousel.carouselSize;
					var resetPos = carousel.scrollPos - ((carousel.carouselSize+carousel.scrollNum)*carousel.itemWidth);
					carousel.scrollPos = resetPos + carousel.scrollLength;
			  	  	carousel.theList.css("left",resetPos);
				}
			}
			// vertical <--
			else
			{
				if (carousel.counter < 1)
				{
					carousel.counter = carousel.counter + carousel.carouselSize;
			  	   	var resetPos = carousel.scrollPos - ((carousel.carouselSize+carousel.scrollNum)*carousel.itemHeight);
			  	   	carousel.scrollPos = resetPos + carousel.scrollLength;
			  	   	carousel.theList.css("top",resetPos);
				}
			}
			carousel.counter = carousel.counter - carousel.scrollNum;
		}
		// console.log("AFTER LOOP - size: "+carousel.carouselSize+", counter: "+carousel.counter);
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
		carousel.listItems.css({float:"left", overflow:"hidden", display:"block", height: carousel.itemHeight+"px", width:carousel.itemWidth+"px"});
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