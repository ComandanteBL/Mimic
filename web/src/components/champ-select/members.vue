<template>
    <div class="scrollable-content">
        <div class="team">
            <span class="team-name">Your Team</span>
            <div class="team-member my" v-for="member in state.myTeam" :key="member.cellId">
                <div class="member-background" :style="getBackgroundStyle(member)"></div>
                <div class="active-background" :class="getActiveOverlayClass(member)"></div>
                
                <div class="summoner-spells" v-if="member.playerType !== 'BOT'">
                    <img :src="getSummonerSpellImage(member.spell1Id)">
                    <img :src="getSummonerSpellImage(member.spell2Id)">
                </div>
                
                <div class="info" :class="member.playerType === 'BOT' && 'bot'">
                    <span class="name">{{ member.displayName }}</span>
                    <span class="state">{{ getMemberSubtext(member) }}</span>
                    
                    <!-- Trade Buttons -->
                    <div class="trade-buttons" v-if="getTradeForMember(member.cellId)">
                        <template v-if="getTradeForMember(member.cellId).state === 'AVAILABLE'">
                            <!-- Show Request Trade button if trade is available -->
                            <button @click="requestTrade(getTradeForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                 <img :src="require('../../static/trade/trade.png')" alt="Request Trade" style="height: 80px;" />
                            </button>
                        </template>
                        <template v-else-if="getTradeForMember(member.cellId).state === 'SENT'">
                            <!-- Show Cancel button if local player requested trade -->
                            <button @click="cancelTrade(getTradeForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                <img :src="require('../../static/trade/cancel.png')" alt="Cancel Trade" style="height: 80px;" />
                            </button>
                        </template>
                        <template v-else-if="getTradeForMember(member.cellId).state === 'RECEIVED'">
                            <div style="display: flex; align-items: center;">
                                <!-- Show Accept and Decline buttons if there's a pending trade request from another player -->
                                <button @click="acceptTrade(getTradeForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                    <img :src="require('../../static/trade/accept.png')" alt="Accept Trade" style="height: 80px;" />
                                </button>
                                <div style="width: 20px;"></div>
                                <button @click="declineTrade(getTradeForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                    <img :src="require('../../static/trade/decline.png')" alt="Decline Trade" style="height: 80px;" />
                                </button>
                            </div>
                        </template>
                    </div>

                    <!-- Swap Buttons -->
                    <div class="swap-buttons" v-if="getSwapForMember(member.cellId)">
                        <template v-if="getSwapForMember(member.cellId).state === 'AVAILABLE'">
                            <button @click="requestSwap(getSwapForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                <img :src="require('../../static/trade/swap.png')" alt="Request Swap" style="height: 80px;" />
                            </button>
                        </template>
                        <template v-else-if="getSwapForMember(member.cellId).state === 'SENT'">
                            <button @click="cancelSwap(getSwapForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                <img :src="require('../../static/trade/cancel.png')" alt="Cancel Swap" style="height: 80px;" />
                            </button>
                        </template>
                        <template v-else-if="getSwapForMember(member.cellId).state === 'RECEIVED'">
                            <div style="display: flex; align-items: center;">
                                <button @click="acceptSwap(getSwapForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                    <img :src="require('../../static/trade/accept.png')" alt="Accept Swap" style="height: 80px;" />
                                </button>
                                <div style="width: 20px;"></div>
                                <button @click="declineSwap(getSwapForMember(member.cellId).id)" style="border: none; padding: 0; background: none;">
                                    <img :src="require('../../static/trade/decline.png')" alt="Decline Swap" style="height: 80px;" />
                                </button>
                            </div>
                        </template>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</template>




<script lang="ts" src="./members.ts"></script>

<style lang="stylus" scoped>
    @require "../../common.styl"

    .scrollable-content
        // String interpolation is needed because variables are ignored in calc.
        flex 1
        overflow-y scroll
        -webkit-overflow-scrolling touch // smooth scrolling on ios

    .team
        display flex
        flex-direction column
        padding-top 20px

    .team-name
        padding 5px 20px
        height 50px
        font-size 40px
        color #f0e6d2
        letter-spacing 0.05em
        font-family "LoL Display Bold"
        text-transform uppercase

    .team-member
        height team-member-height
        box-sizing border-box
        border-bottom 1px solid #cdbe93
        position relative
        display flex
        align-items center
        color white

        &:first-of-type
            border-top 1px solid #cdbe93

    .summoner-spells
        margin 10px 20px
        display flex
        flex-direction column
        align-items center
        justify-content space-around

        img
            width 60px
            height 60px

    .info
        display flex
        flex-direction column
        font-family "LoL Body"

        .name
            font-size 45px
            text-shadow 4px 4px 5px #111

        .state
            display inline-block
            height 30px
            transition 0.3s ease
            font-size 30px
            color #fffaef
            text-shadow 4px 4px 5px #111

        .state:empty
            height 0

    .enemy .info, .info.bot
        margin-left 20px

    .member-background
        position absolute
        z-index -1
        left 0
        top 0
        bottom 0
        right 0
        background-repeat no-repeat
        background-position 0 -80px
        background-size cover
        transition 0.3s ease

        &:after
            content ""
            position absolute
            left 0
            top 0
            bottom 0
            right 0
            background-image linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)

    @keyframes champ-select-active-background
        0% { background-position: 100% 0; }
        50% { background-position: 0 100%; }
        100% { background-position: 100% 0; }

    .active-background
        transition 0.3s ease
        position absolute
        z-index -1
        left 0
        top 0
        bottom 0
        right 0
        opacity 0
        animation champ-select-active-background 5s ease infinite

        &.picking
            opacity 1
            background linear-gradient(186deg, alpha(#197e99, 0.5), alpha(#134b6d, 0.3), alpha(#197e99, 0.6), alpha(#1e465d, 0.4))
            background-size 400% 400%

        &.banning
            opacity 1
            background linear-gradient(186deg, alpha(#c6403b, 0.4), alpha(#f9413f, 0.2), alpha(#ec3930, 0.5), alpha(#ee241d, 0.3))
            background-size 400% 400%
</style>