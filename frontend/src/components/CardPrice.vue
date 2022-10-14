<template>
    <v-card
        class="cardPrice d-flex flex-column"
    >
        <v-card-title>
            <h2>{{ title }}</h2>
            <p>{{ discountActive ? priceMonthYear : priceMonth }}/mês</p>
        </v-card-title>

        <v-card-subtitle v-if="discountActive">
            <p>Você economiza {{ discountYear }} no plano anual</p>
            <p>{{ priceYear }}/ano</p>
        </v-card-subtitle>
        <v-card-subtitle v-else>
            <p>Você pode economizar {{ discountYear }} no plano anual</p>
        </v-card-subtitle>

        <v-divider color="white"></v-divider>

        <v-card-text>
            <p v-for="(item, key) in item" :key="key">
                <a v-if="item.active">
                    <v-icon
                    large
                    >
                        mdi-check
                    </v-icon>
                    {{ item.text }}
                </a>
                <a v-else>
                    <v-icon
                    large
                    >
                        mdi-close
                    </v-icon>
                    {{ item.text }}
                </a>
            </p>
        </v-card-text>

        <v-card-actions class="justify-center">
            <v-btn class="btn btn_hover_1" append-icon="mdi-cart">Assinar</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style>
    @import '@/assets/styles.css';
</style>

<script>
    export default {
        name: 'CardPrice',
        props: {
            title          : String,
            item           : Object,
            icon           : String,
            priceMonth     : String,
            priceMonthYear : String,
            priceYear      : String,
            discountYear   : String,
            discountActive : Boolean
        }
    }
</script>