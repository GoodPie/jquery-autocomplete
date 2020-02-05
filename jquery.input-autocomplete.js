/*
 * Basic autocomplete for inputs using predefined values
 * @Version: 0.0.1
 * @Author: Brandyn Britton 
 * @Contact: @brandynbb
 * @Source: 
 */


(function($) {

    const defaults = {
        predictableText : [],
        delay           : 100,       // Time (in ms) between search updates
        searchColour    : "#757575", // Colour of autocomplete text that's not yet entered
        maxWordLength   : 100,

        // Callbacks
        onLoad          : function(element) {},
        onAutocomplete  : function(element, value) {}
    }

    let inputAutocompleteInstanceId = 0;

    String.prototype.insert = function (index, string) {
        if (index > 0)
          return this.substring(0, index) + string + this.substring(index, this.length);
        
        return string + this;
      };

      String.prototype.remainderOfSlice = function(begin, end) {

        begin = begin || 0
        end = (end === undefined) ? this.length : end 
    
        if (this.slice(begin, end) === '') return this + ''
        return this.slice(0, begin) + this.slice(end) 
     }

    function InputAutocomplete(element, options) {
        this.element    = element;
        this.options    = $.extend(true, {}, defaults, options)
        this.searchText = [];
        this.instanceId = inputAutocompleteInstanceId;

        // Load the autocomplete instance for this element
        this.load();
    }


    

    InputAutocomplete.prototype = {

        load: function() {
            
            var instance = this;
            inputAutocompleteInstanceId += 1;

            this.buildDropdown();

            let wordHasChanged = false;
            let oldWord = "";
            let currentIndex = 0;
            $(instance.element).keyup(function(event) {

                // Get the current caret position and check for a word
                
                let caretPos = $(instance.element)[0].selectionStart;
                let currentWordInfo = instance.getWord(caretPos);
                let currentWord = currentWordInfo.word;
                currentWord = currentWord ? currentWord : null;
                if (currentWord !== oldWord) {
                    wordHasChanged = true;
                } else {
                    wordHasChanged = false;
                }

                oldWord = currentWord;

                if (wordHasChanged) {
                    instance.searchText = [];

                    if (currentWord == null) return;

                    for (let i = 0; i < instance.options.predictableText.length; i++) {
                        if (instance.options.predictableText[i].toLowerCase().includes(currentWord.toLowerCase())) {
                            instance.searchText.push(instance.options.predictableText[i]);
                        } 
                    }

                    let innerList = "";
                    for(let j = 0; j < instance.searchText.length; j++ ) {
                        innerList += "<li>" + instance.searchText[j] + "</li>"
                    }
                    const list = $("#autocompleteList" + instance.instanceId);
                    list.html(innerList);

                    $(".autocompleteList").children().css({
                        "padding": "2px 5px",
                        "font-size": $(instance.element).css("font-size"),
                    });

                    currentIndex = 0;
                } else {
                    if (event.which == 38) {
                        currentIndex -= 1;
                        if (currentIndex < 0) currentIndex = 0;
                    } else if (event.which == 40) {
                        currentIndex += 1;
                        console.log(instance.searchText.length);
                        if (currentIndex >= instance.searchText.length) currentIndex = instance.searchText.length - 1;
                        console.log(currentIndex);
                    } else if (event.which == 13 || event.which == 9) {
                        if (instance.searchText[currentIndex]) {
                            let caretPos = $(instance.element)[0].selectionStart;
                            let currentWordInfo = instance.getWord(caretPos);
                            let newString = $(instance.element).val().remainderOfSlice(currentWordInfo.start, currentWordInfo.end).insert(caretPos, instance.searchText[currentIndex]);
                            $(instance.element).val(newString);
                        }
                        
                    }

                    $(".autocompleteList").children().css({
                        "background": "white",
                        "color": "black"
                    });
                    
                }

                $($(".autocompleteList").children()[currentIndex]).css({
                    "background-color": instance.options.searchColour,
                    "color" : "white"
                });

            });
        },

        buildDropdown: function(pos) {
            const instance = this;
            $(instance.element).after("<ul class='autocompleteList' id='autocompleteList" + this.instanceId + "'></ul>");
            $(".autocompleteList").css({
                "margin": 0,
                "width": $(instance.element).innerWidth(), 
                "position": "absolute",
                "top": $(instance.element).position().bottom,
                "left": $(instance.element).position().left,
                "right": $(instance.element).position().right,
                "list-style" : "none",
                "padding": 0,
                "border" : "1px solid black"    
            });

            $(".autocompleteList").children().css({
                "padding": "10px 0",
                "font-size": $(instance.element).css("font-size")
            });
        },

        getWord: function(caretPos) {

            let instance = this;
            const currentVal = $(instance.element).val();
            let startIndex;
            let endIndex;
            
            let foundStart = false;
            startIndex = caretPos;
            while (!foundStart) {
                if (startIndex === 0) {
                    foundStart = true;
                    break;
                } else if  (currentVal[startIndex] === " ") {
                    startIndex += 1;
                    foundStart = true;
                    break;
                }      

                startIndex -= 1;
            }
    
            let foundEnd = false
            endIndex = caretPos;
            while (!foundEnd) {
                if (endIndex === currentVal.length) {
                    foundEnd = true;
                    break;
                } else if (currentVal[endIndex] === " ") {
                    foundEnd = true;
                    break;
                }

                endIndex += 1;
            }

            const meme =  {start: startIndex, end: endIndex, word: currentVal.substring(startIndex, endIndex)};
            console.log(meme);
            return meme;
        },
    };

    

    $.fn.inputAutocomplete = function(options) {
        if (!this.length) {
            return;
        }

        if ((options === undefined) || (typeof options === 'object')) {
            return this.each(function() {
                if (!$.data(this, 'plugin_inputAutocomplete')) {
                    $.data(this, 'plugin_inputAutocomplete', new InputAutocomplete(this, options));
                }
            });
        }

    }
}(jQuery));