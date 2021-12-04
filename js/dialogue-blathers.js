Vue.config.devtools = true;

Vue.component("dialogue-blathers", {
    template: "#dialogue-blathers"
});

Vue.component("dialogue-text-blathers", {
    template: "#dialogue-text-blathers",
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

const appBlathers = new Vue({
    el: "#app-blathers",
    mounted() {
        setTimeout(() => {
            //this.$refs.audio.play();
        }, 2000);
    }
});