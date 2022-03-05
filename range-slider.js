function getSliderValue (id){
    return (Number(document.querySelector("#"+id).shadow.querySelector("#"+id+"Value").textContent));
}

function getSliderTrack (id){
    return (document.querySelector("#"+id).shadow.querySelector("#"+id+"Track"));
}


customElements.define('range-slider',
    class extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: 'open' });

            //get user specified slider attributes
            if (!this.getSliderAttributes()){
                console.log("Some attributes are not valid.")
            }

            //create slider element and its style, give an id, append
            this.rangeSliderContainer = document.createElement('div');
            this.rangeSliderThumbStyle = document.createElement('style');
            this.rangeSliderDisplay = document.createElement('style');
            
            this.rangeSliderThumbStyle.setAttribute("id", this.sliderId+"ThumbStyle"); 
            this.rangeSliderDisplay.setAttribute("id", this.sliderId+"DisplayStyle");   

            this.shadow.appendChild(this.rangeSliderThumbStyle);
            this.shadow.appendChild(this.rangeSliderContainer);
            this.shadow.appendChild(this.rangeSliderDisplay);

            //set initial html
            this.setInitialInnerHTML();
            this.modified = 0;

            //get elements to add events and reset style
            this.rangeSliderTrack = this.shadow.getElementById(this.sliderId+"Track");
            this.rangeSliderThumb = this.shadow.getElementById(this.sliderId+"Thumb");
            this.thumbStyles = this.shadow.getElementById(this.sliderId+"ThumbStyle");
            this.sliderValue = this.shadow.getElementById(this.sliderId+"Value");

            //click on the track even triggers the thumb to be relocated
            this.rangeSliderTrack.addEventListener('click', (e) => {

                //calculate the left margin of the thumb, move thumb by modifying left margin
                this.newLeftMargin = e.target.getBoundingClientRect().left+ window.scrollX;
                this.thumbStylesModify(e.pageX);
                this.modified++;
                
                //calculate the slider value, based on the click location, the left margin of the slider, min&max value of the slider, and the length of the track.
                this.sliderCurr=Math.min(Math.max(parseInt((e.pageX-this.newLeftMargin)/(this.sliderLength)*(this.sliderMax-this.sliderMin)+this.sliderMin), this.sliderMin), this.sliderMax);
                
                //reset the value of the "sliderCurr" so users can get updated value.
                this.sliderValue.innerHTML=`
                ${this.sliderCurr}
                `
            });

            

            //mouse pointer over on the thumb will trigger the value of the slider to be displayed. 
            this.rangeSliderThumb.addEventListener('mouseenter', (e) => {
                if (this.showIndicator === "visible"){
                    this.displayStyleModify(e.pageX, 1);
                }
            });
            //mouse pointer over on the thumb will trigger the value of the slider to be displayed. 
            this.rangeSliderThumb.addEventListener('mouseleave', (e) => {
                this.displayStyleModify(e.pageX, "hidden");
            });
        }

        getSliderAttributes () {

            this.sliderId = this.getAttribute('id');
            this.sliderMin = Number(this.getAttribute('min')) || 0;
            this.sliderMax = Number(this.getAttribute('max')) || 100; //must be greater than min
            this.sliderCurr = Number(this.getAttribute('initial')) || (this.sliderMin+this.sliderMax)/2; //must be btw min and max
            this.sliderLength = Number(this.getAttribute('length')) || 200; //pixel value
            this.sliderLength = Math.max(0,this.sliderLength);
            this.sliderHeight = Number(this.getAttribute('height')) || 15; //pixel value
            this.sliderHeight = Math.max(0,this.sliderHeight);
            this.thumbRounding = Number(this.getAttribute('thumbRounding')) || 1;
            this.thumbRounding = Math.min(Math.max(0, this.thumbRounding),1) * 50;//from 0-1
            this.showNumbers = "visible";
            this.showIndicator = "visible";
            if (this.getAttribute('showNumbers') === "false"){
                this.showNumbers = "hidden";
            } 
            
            if (this.getAttribute('showIndicator') === "false"){
                this.showIndicator = "hidden";
            } 
            if (this.isHexColor(this.getAttribute('trackColor'))){
                this.trackColor = this.getAttribute('trackColor')
            } else {
                this.trackColor = "#8FBC8F";
            }
            if (this.isHexColor(this.getAttribute('thumbBorderColor'))){
                this.thumbBorderColor = this.getAttribute('thumbBorderColor')
            } else {
                this.thumbBorderColor = this.trackColor;
            }
            if (this.isHexColor(this.getAttribute('thumbColor'))){
                this.thumbColor = this.getAttribute('thumbColor')
            } else {
                this.thumbColor = "#FFFFFF";
            }

            return (this.sliderMax > this.sliderMin)&&(this.sliderCurr <= this.sliderMax)&&(this.sliderCurr >= this.sliderMin)
        }

        isHexColor(str){
            return (typeof(str) === "string") && (str[0] === "#") && (!isNaN(Number('0x' + str.slice(1))))
        }
        
        setInitialInnerHTML() {

            this.rangeSliderThumbStyle.innerHTML = `
            .thumb {
            border-style: solid;
            border-color: ${this.thumbBorderColor};
            border-width:${this.sliderHeight * 0.15}px;
            background-image: radial-gradient(ellipse at 5% 10%, ${this.thumbColor} 60% , grey);
            width:${this.sliderHeight * 1.1}px;
            height:${this.sliderHeight * 1.1}px;
            border-radius:${this.thumbRounding}%;
            z-index:2;
            position: absolute;
            margin-left: ${this.sliderLength*(this.sliderCurr-this.sliderMin)/(this.sliderMax-this.sliderMin)}px;
            transition: margin 250ms;
            }
            .thumb:hover  {
                background-image: radial-gradient(ellipse at 95% 90%, ${this.thumbColor} 60% , grey);
            }
            `
            
            this.rangeSliderDisplay.innerHTML = `
            .slider-value-display{
                z-index:3;
                min-width:40px;
                height:30px;
                background-color:lightgrey;
                border-radius:10%;
                position:absolute;
                text-align:center;
                line-height:30px;
                margin-left: ${this.sliderLength*(this.sliderCurr-this.sliderMin)/(this.sliderMax-this.sliderMin)+this.sliderHeight*1.5}px;
                opacity:0;
                transition: opacity 150ms;
            }
            `
            this.rangeSliderContainer.innerHTML = `
            <style>
            .track {
                background-color:${this.trackColor};
                width:${this.sliderLength}px;
                height:${this.sliderHeight}px;  
                margin-left: auto;
                margin-right: auto;             
                border-radius:${this.sliderLength/20}px;
                z-index:1;
            }
            .range-slider-numbers {
                width: 30px;
                visibility: ${this.showNumbers};
            }
            .range-slider-wrapper {
                margin: 10px;
                padding: 10px;
                gap: 10px;
                display:flex;
                min-height:${this.sliderHeight * 1.40}px;
                align-items: center;
                flex: 1 0 auto;
            }
            .range-slider-track-wrapper {
                align-items: center;
                display: flex;
                width: ${this.sliderLength+20}px;
                min-width: ${this.sliderLength+this.sliderHeight*1.2}px;
            }
            </style>
            
            <div class="range-slider-wrapper">
                <div class="range-slider-numbers">
                    ${this.sliderMin}
                </div>
                <div class="range-slider-track-wrapper">
                    <div class="thumb" id = ${this.sliderId+"Thumb"}></div>
                    <div class="slider-value-display" id=${this.sliderId+"Value"}>${this.sliderCurr}</div>
                    <div class="track" id = ${this.sliderId+"Track"}></div>
                </div>
                <div class="range-slider-numbers">
                    ${this.sliderMax}
                </div>
            </div>

            `
            return;
        }

        thumbStylesModify(x) {
            this.thumbStyles.innerHTML = `
            .thumb {
                border-style: solid;
                border-color: ${this.thumbBorderColor};
                border-width:${this.sliderHeight * 0.15}px;
                background-image: radial-gradient(ellipse at 5% 10%, ${this.thumbColor} 60% , grey);
                width:${this.sliderHeight * 1.1}px;
                height:${this.sliderHeight * 1.1}px;
                border-radius:${this.thumbRounding}%;
                z-index:2;
                position: absolute;
                margin-left: ${x-this.newLeftMargin}px;
                transition: margin 250ms;
            }
            .thumb:hover  {
                background-image: radial-gradient(ellipse at 95% 90%, ${this.thumbColor} 60% , grey);
            }
            `
            return;
        }

        displayStyleModify(x, visibility) {

            let hoverMarginLeft = x-this.newLeftMargin+this.sliderHeight;
            
            if(this.modified<=0){
                hoverMarginLeft = this.sliderLength*(this.sliderCurr-this.sliderMin)/(this.sliderMax-this.sliderMin)+this.sliderHeight*1.5;
            } 


            this.rangeSliderDisplay.innerHTML = `
            .slider-value-display{
                z-index:3;
                min-width:40px;
                height:30px;
                background-color:lightgrey;
                border-radius:10%;
                position:absolute;
                text-align:center;
                line-height:30px;
                margin-left: ${hoverMarginLeft}px;
                visibility:${visibility};
            }
            `
            return;
        }
    }
);