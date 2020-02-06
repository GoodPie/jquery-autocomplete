/*
 * Basic autocomplete for inputs using predefined values
 * @Version: 0.0.1
 * @Author: Brandyn Britton 
 * @Contact: @brandynbb
 * @Source: 
 */


(function ($) {

    // Keep an instance of the auto complete instances
    let inputAutocompleteInstanceId = 0;

    const defaults = {
        predictableText: [],        // List of words to use for predictions

        // Callbacks
        onLoad: function (element) { },
        onAutocomplete: function (element, value) { }
    }


    //  Polyfill to allow the insertion of text at a certain index
    String.prototype.insert = function (index, string) {
        if (index > 0)
            return this.substring(0, index) + string + this.substring(index, this.length);

        return string + this;
    };

    // Polyfill to allow the removal of characters from begin to end indexz
    String.prototype.remainderOfSlice = function (begin, end) {

        begin = begin || 0
        end = (end === undefined) ? this.length : end

        if (this.slice(begin, end) === '') return this + ''
        return this.slice(0, begin) + this.slice(end)
    }

    function InputAutocomplete(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options)
        this.searchText = [];
        this.instanceId = inputAutocompleteInstanceId;
        this.currentlySelectedIndex = 0;

        // Load the autocomplete instance for this element
        this.load();
    }

    InputAutocomplete.prototype = {

        load: function () {

            // Assume new instance is created when load  is called
            inputAutocompleteInstanceId += 1;
            var instance = this;

            // Build the dropdown container
            this.buildDropdown();

            // Hide the input initially until focused to prevent the border from showing
            $(instance.element).siblings('.autocompleteList').hide();

            $(instance.element).blur(function () {
                $(instance.element).siblings('.autocompleteList').hide();
            });

            $(instance.element).focus(function () {
                $(instance.element).siblings('.autocompleteList').show();
            });

            // Listen to keyup events whenever the instance is focused and determine how to handle that
            let wordHasChanged = false;
            let oldWordMeta = { word: "" };
            $(instance.element).keyup(function (event) {

                // Get the word info under the cursor
                let caretPos = $(instance.element)[0].selectionStart;
                let currentWordMeta = instance.getWordUnderCaret(caretPos);

                // Need to keep track of whether the word has changed so we can perform the appropriate actions
                wordHasChanged = oldWordMeta.word !== currentWordMeta.word;
                oldWordMeta = currentWordMeta;

                // Word has changed so refresh the searchText array with words that match
                if (wordHasChanged && currentWordMeta.word !== null) {

                    console.log(currentWordMeta);

                    // Reset to nothing and refresh if words are valid
                    instance.searchText = []
                    for (let i = 0; i < instance.options.predictableText.length; i++) {
                        if (instance.options.predictableText[i].toLowerCase().includes(currentWordMeta.word.toLowerCase())) {
                            instance.searchText.push(instance.options.predictableText[i]);
                        }
                    }

                    // Build the new list elements
                    let wordPredictionListElements = "";
                    for (let j = 0; j < instance.searchText.length; j++) {
                        const newListElement = "<li>" + instance.searchText[j] + "</li>"
                        wordPredictionListElements += newListElement;
                    }
                    const wordPredictionList = $(instance.element).siblings(".autocompleteList");
                    wordPredictionList.html(wordPredictionListElements);
                    instance.updateAutocompleteList(instance);

                    instance.currentlySelectedIndex = 0;
                }
                else 
                {
                    if (event.which === 38) {
                        instance.currentlySelectedIndex -= 1;
                        if (instance.currentlySelectedIndex < 0) instance.currentlySelectedIndex = 0;
                    } else if (event.which === 40) {
                        instance.currentlySelectedIndex += 1;
                        if (instance.currentlySelectedIndex >= instance.searchText.length) instance.currentlySelectedIndex = instance.searchText.length - 1;
                    } else if (event.which === 13 || event.which === 9) {
                        // Enter or Tab has been pressed which means the user wants to select the word
                        // Build the new input value by replacing the old, incomplete word with the new word they selected
                        if (instance.searchText[instance.currentlySelectedIndex]) {
                            const currentInputValue = $(instance.element).val();
                            const newInputValue = currentInputValue.remainderOfSlice(oldWordMeta.start, oldWordMeta.end).insert(oldWordMeta.caretPos, instance.searchText[instance.currentlySelectedIndex]);
                            $(instance.element).val(newInputValue);
                        }
                    }

                    instance.updateAutocompleteList(instance);
                }

            });
        },

        updateAutocompleteList: function (instance) {

            // Apply the selected attribute to the currently selected element
            const listElement = $(instance.element).siblings('.autocompleteList');
            $(listElement).children().removeClass("selected");
            $($(listElement).children()[instance.currentlySelectedIndex]).addClass("selected");

            // Need to refresh the onclick listeners for individual list elements because they have been refreshed
            $(".autocompleteList li").on({
                mouseenter: function () {
                    instance.currentlySelectedIndex = $(this).index();
                    $(this).addClass("selected");
                },
                mouseleave: function () {
                    instance.currentlySelectedIndex = 0;
                    $(this).removeClass("selected");
                }
            });

            $(instance.element).siblings(".autocompleteList").children().css({
                "font-size": $(instance.element).css("font-size"),
            });

        },

        /**
         * Builds the dropdown container for the autocomplete instance
         */
        buildDropdown: function () {

            const instance = this;

            $(this.element).after("<ul class='autocompleteList' id='autocompleteList" + this.instanceId + "'></ul>");



            // I like dropdowns that match the original input box so position accordingly
            $(".autocompleteList").css({
                "position": "absolute",
                "width": $(this.element).innerWidth(),
                "top": $(this.element).position().bottom,
                "left": $(this.element).position().left,
                "right": $(this.element).position().right,
            });

            // I also like dropdowns that match the inputs font size
            $(".autocompleteList").children().css({
                "font-size": $(this.element).css("font-size")
            });
        },

        /**
         * Gets the current word from the input instance
         * Will also return the start index of the current word and the end index
         * 
         * @param {number} caretPos Position of the caret within the input
         */
        getWordUnderCaret: function (caretPos) {

            const currentVal = $(this.element).val();

            // Branch to the left of the current index until we hit a space or start of input
            // Assume this is the start point of the current word
            let startIndex = caretPos;
            while (true) {
                if (startIndex === 0) {
                    break;
                }
                else if (currentVal[startIndex] === " ") {
                    startIndex += 1;
                    break;
                }

                startIndex -= 1;
            }

            // Branch to the right of the current index unti we hit a space or end of input
            // Assume this is the end of the current word
            let endIndex = caretPos;
            while (true) {
                if (endIndex === currentVal.length || currentVal[endIndex] === " ") {
                    break;
                }

                endIndex += 1;
            }

            // For easier future use, just set the word to null if it has no value
            const word = currentVal.substring(startIndex, endIndex);
            word ? $.trim(word) : null;

            return { start: startIndex, end: endIndex, caretPos: caretPos, word: word };
        },
    };



    $.fn.inputAutocomplete = function (options) {
        if (!this.length) {
            return;
        }

        if ((options === undefined) || (typeof options === 'object')) {
            return this.each(function () {
                if (!$.data(this, 'plugin_inputAutocomplete')) {
                    $.data(this, 'plugin_inputAutocomplete', new InputAutocomplete(this, options));
                }
            });
        }

    }
}(jQuery));