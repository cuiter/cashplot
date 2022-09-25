<template>
    <div class="progress-bar full-width margin-top-small">
        <div
            class="progress-bar-success-line"
            :style="{ width: successPortionPercentage + '%' }"
        ></div>
        <div
            class="progress-bar-overflow-line"
            :style="{ width: overflowPortionPercentage + '%' }"
        ></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        percentage: { type: Number, default: () => 0 },
    },
    computed: {
        successPortionPercentage: function () {
            const percentage = this.$props.percentage;

            if (percentage <= 100) {
                return percentage;
            } else {
                return (100 / percentage) * 100;
            }
        },
        overflowPortionPercentage: function () {
            const percentage = (this.$props as any).percentage;

            if (percentage <= 100) {
                return 0;
            } else {
                return 100;
            }
        },
    },
});
</script>
