<template>
    <button class="button flex-item-full" @click="opened = !opened" @blur="opened = false">
        <div
            class="option-selection-options"
            :class="{
                disabled: opened === false,
                'drop-down': dropDown,
                'drop-up': !dropDown,
            }"
        >
            <span v-for="(option, index) in options" @click="onOptionSelected(option)">
                {{ optionNames[index] || option }}
            </span>
        </div>
        <span class="float-left option-selection-name">{{ selectedOptionName }}</span>
        <span v-if="dropDown === false" class="float-right option-selection-tick">▲</span>
        <span v-if="dropDown === true" class="float-right option-selection-tick">▼</span>
    </button>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        value: { type: String, default: () => "" }, // Selected option
        options: { type: Array, default: () => [] }, // Option values
        optionNames: { type: Array, default: () => [] }, // Optional, option display names
        dropDown: { type: Boolean, default: () => true }, // Whether to drop down (true) or up (false)
    },
    data: function () {
        return {
            opened: false,
        };
    },
    computed: {
        selectedOptionName: function () {
            const option = this.$props.value;
            const optionIndex = this.$props.options.indexOf(option);
            const optionName = this.$props.optionNames[optionIndex];

            return optionName || option;
        },
    },
    created: function () {
        const currentOption = this.$props.value;
        if (currentOption === "") {
            const firstOption = this.$props.options[0];
            if (firstOption !== undefined) {
                this.$props.value = firstOption;
            }
        }
    },
    methods: {
        onOptionSelected: function (option: string) {
            this.$props.value = option;
            this.$emit("input", option);
        },
    },
});
</script>
