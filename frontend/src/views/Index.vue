<template>
  <v-container>
    <v-row>
      <v-col
        class="index"
        sm="12"
      >
        <h1 style="color: #5CFFA6">White Stock</h1>
        <h2>Uma solução mais que completa</h2>
        <h2>para você gerenciar o seu estoque</h2>

        <v-btn
          class="btn btn_hover_0"
          append-icon="mdi-chevron-double-right"
          onclick="document.getElementById('plan').scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});"
        >
          Começar agora
        </v-btn>
        OU
        <v-btn
          class="btnLogin btn_hover_0"
          append-icon="mdi-chevron-double-right"
          @click="showLoginComponent = true"
        >
          Já tenho uma conta
        </v-btn>
        <LoginComponent v-model="showLoginComponent" @close="showLoginComponent = false" id="loginComponent"/>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(item, key) in cardInfo" :key="key"
        sm="4"
      >
        <CardComponent
          :icon="item.icon"
          :title="item.title"
          :text="item.text"
        ></CardComponent>
      </v-col>
    </v-row>

    <v-row style="margin-top: 5rem; text-align: center;" id="plan">
      <v-col
        sm="12"
      >
        <h1>Planos e Preços</h1>
        <v-switch
          style="display: flex; justify-content: center;"
          v-model="billingType"
          hide-details
          inset
          :label="billingType ? 'Pagamento anual, com desconto' : 'Pagamento mensal, sem desconto'"
        ></v-switch>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(item, key) in cardPrice" :key="key"
        sm="4"
      >
        <CardPriceComponent
          :id="item.id"
          :title="item.title"
          :item="item.item"
          :priceMonth="item.priceMonth"
          :priceMonthYear="item.priceMonthYear"
          :priceYear="item.priceYear"
          :discountYear="item.discountYear"
          :discountActive="billingType"
        ></CardPriceComponent>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
  import LoginComponent from '@/components/LoginComponent.vue'
  import CardComponent from '@/components/CardComponent.vue'
  import CardPriceComponent from '@/components/CardPriceComponent.vue'

  export default {
    name: 'IndexPage',
    
    components: {
      LoginComponent,
      CardComponent,
      CardPriceComponent
    },

    data: () => ({
      showLoginComponent: false,
      billingType       : false,

      cardInfo: [
        {
          title: 'Controle',
          text: 'Controle o seu estoque com facilidade e praticidade com automação de pedidos de produtos diretamente do seu fornecedor',
          icon: 'mdi-package-variant-closed'
        },
        {
          title: 'Gerencie',
          text: 'Ajudamos você a melhorar o gerenciamento do seu estoque independente do tamanho da sua empresa, assim você poupa tempo e dinheiro',
          icon: 'mdi-store'
        },
        {
          title: 'Personalize',
          text: 'Oferecemos a personalização do sistema para deixá-lo de acordo com as suas necessidades e com a cara da sua empresa',
          icon: 'mdi-brush'
        },
      ],

      cardPrice: [
        {
          id            : '1',
          title         : 'Start',
          priceMonth    : 'R$49,99',
          priceMonthYear: 'R$44,99',
          priceYear     : 'R$539,89',
          discountYear  : '10%',

          item: [
            {
              text: '50 Ilimitados',
              active: true
            },
            {
              text: '100 Produtos',
              active: true
            },
            {
              text: 'Automação do Estoque',
              active: false
            },
            {
              text: 'Personalização da Ferramenta',
              active: false
            }
          ]
        },
        {
          id            : '2',
          title         : 'Lite',
          priceMonth    : 'R$69,99',
          priceMonthYear: 'R$55,99',
          priceYear     : 'R$671,89',
          discountYear  : '20%',

          item: [
            {
              text: '3500 Funcionários',
              active: true
            },
            {
              text: '5000 Produtos',
              active: true
            },
            {
              text: 'Automação do Estoque',
              active: true
            },
            {
              text: 'Personalização da Ferramenta',
              active: false
            }
          ]
        },
        {
          id            : '3',
          title         : 'Pro',
          priceMonth    : 'R$89,99',
          priceMonthYear: 'R$62,99',
          priceYear     : 'R$755,89',
          discountYear  : '30%',

          item: [
            {
              text: 'Funcionários Ilimitados',
              active: true
            },
            {
              text: 'Produtos Ilimitados',
              active: true
            },
            {
              text: 'Automação do Estoque',
              active: true
            },
            {
              text: 'Personalização da Ferramenta',
              active: true
            }
          ]
        },
      ],
    }),

    beforeMount() {
      if (window.location.hash == '#login') this.showLoginComponent = true;
    }
  }
</script>
