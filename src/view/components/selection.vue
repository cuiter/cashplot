<template>
    <button
        class="button flex-item-full"
        @click="opened = !opened"
        @blur="opened = false"
    >
        <div
            class="selection-options"
            :class="{
                disabled: opened === false,
                'drop-down': dropDown,
                'drop-up': !dropDown,
            }"
        >
            <span
                v-for="(option, index) in options"
                @click="onOptionSelected(option)"
            >
                {{ optionNames[index] || option }}
            </span>
        </div>
        <span class="float-left select-name">{{ selectedOptionName }}</span>
        <span v-if="dropDown === false" class="float-right select-tick">▲</span>
        <span v-if="dropDown === true" class="float-right select-tick">▼</span>
    </button>
</template>

<script lang="ts">
export default {
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
    created: function () {
        const currentOption = (this as any).$props.value;
        if (currentOption === "") {
            const firstOption = (this as any).$props.options[0];
            if (firstOption !== undefined) {
                (this as any).$props.value = firstOption;
            }
        }
    },
    computed: {
        selectedOptionName: function () {
            const option = (this as any).$props.value;
            const optionIndex = (this as any).$props.options.indexOf(option);
            const optionName = (this as any).$props.optionNames[optionIndex];

            return optionName || option;
        },
    },
    methods: {
        onOptionSelected: function (option: string) {
            (this as any).$props.value = option;
            (this as any).$emit("input", option);
        },
    },
};
</script>
