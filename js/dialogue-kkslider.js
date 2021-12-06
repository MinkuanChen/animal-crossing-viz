Vue.config.devtools = true;

Vue.component("dialogue-kkslider", {
    template: "#dialogue-kkslider"
});

Vue.component("dialogue-text-kkslider", {
    template: "#dialogue-text-kkslider",
    data() {
        return {
            text: "",
            displayedText: ""
        };
    },
    created() {
        this.text = this.$slots.default[0].text;
    },
    mounted() {
        const speed = 25;
        const delay = 2000;
        let i = 0;

        const typewriter = () => {
            if (i < this.text.length) {
                this.displayedText += this.text.charAt(i);
                i++;
                setTimeout(typewriter, speed);
            }
        };

        setTimeout(typewriter, delay);
    }
});

const appKKSlider = new Vue({
    el: "#app-kkslider",
    mounted() {
        setTimeout(() => {
            //this.$refs.audio.play();
        }, 2000);
    }
});