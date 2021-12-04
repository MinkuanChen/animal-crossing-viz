Vue.config.devtools = true;

Vue.component("dialogue-sasha", {
    template: "#dialogue-sasha"
});

Vue.component("dialogue-text-sasha", {
    template: "#dialogue-text-sasha",
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

const appSasha = new Vue({
    el: "#app-sasha",
    mounted() {
        setTimeout(() => {
            //this.$refs.audio.play();
        }, 2000);
    }
});