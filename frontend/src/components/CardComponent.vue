<template>
    <v-card
        class="card"
    >
        <v-card-title>
            <v-icon
                large
            >
                {{ icon }}
            </v-icon>
            {{ title }}
        </v-card-title>

        <v-card-text>
            {{ text }}
        </v-card-text>
    </v-card>
</template>

<style>
    @import '@/assets/styles.css';
</style>

<script>
    export default {
        name: 'CardComponent',
        
        props: {
            title: String,
            text : String,
            icon : String
        }
    }
</script>