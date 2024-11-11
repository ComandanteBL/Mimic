import Root from "../root/root";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { default as ChampSelect, ChampSelectState, ChampSelectMember } from "./champ-select";
import { POSITION_NAMES } from "@/constants";

interface Trade {
    cellId: number;
    id: number;
    state: string;
}

interface Swap {
    cellId: number;
    id: number;
    state: string;
}

@Component
export default class Members extends Vue {
    $root: Root;
    $parent: ChampSelect;

    @Prop()
    state: ChampSelectState;

    // Store the trades fetched from the API
    trades: Trade[] = [];
    swaps: Swap[] = [];
    tradeRefreshInterval: number = 1000; // Interval in milliseconds

    mounted() {
        this.startPolling();
    }

    // Timer reference for clearing the polling interval
    pollingTimer: number | undefined = undefined;

    /**
     * Start polling trades every few seconds.
     */
    startPolling() {
        this.fetchAvailableTrades();
        this.fetchAvailableSwaps(); // Fetch swaps
        this.pollingTimer = window.setInterval(() => {
            this.fetchAvailableTrades();
            this.fetchAvailableSwaps();
        }, this.tradeRefreshInterval);
    }


    
    /**
     * Fetch available trades and store them.
     */
    async fetchAvailableTrades() {
        try {
            const response = await this.$root.request("/lol-champ-select/v1/session/trades", "GET");
            if (response.status === 200) {
                this.trades = response.content || [];
                console.log(`FETCH trades: ${JSON.stringify(this.trades)}`)
            }
        } catch (error) {
            console.error("Failed to fetch available trades:", error);
        }
    }

    /**
     * Fetch available swaps and store them.
     */
    async fetchAvailableSwaps() {
        try {
            const response = await this.$root.request("/lol-champ-select/v1/session/swaps", "GET");
            if (response.status === 200) {
                this.swaps = response.content || [];
                console.log(`FETCH swaps: ${JSON.stringify(this.swaps)}`);
            }
        } catch (error) {
            console.error("Failed to fetch available swaps:", error);
        }
    }

    /**
     * Gets the trade associated with a given cellId, if available.
     */
    getTradeForMember(cellId: number): Trade | null {
        return this.trades.find(trade => trade.cellId === cellId) || null;
    }

    /**
     * Gets the swap associated with a given cellId, if available.
     */
    getSwapForMember(cellId: number): Swap | null {
        return this.swaps.find(swap => swap.cellId === cellId) || null;
    }

    /**
     * Requests a trade with a team member based on their trade ID.
     * @param tradeId - The trade ID of the summoner to request a trade with.
     */
    requestTrade(tradeId: number) {
        const url = `/lol-champ-select/v1/session/trades/${tradeId}/request`;
        this.$root.request(url, "POST")
            .then(response => {
                if (response.status === 200) {
                    console.log("Trade request sent successfully:", response.content);
                    this.fetchAvailableTrades(); // Refresh trades immediately
                } else {
                    console.error("Failed to send trade request:", response);
                }
            })
            .catch(error => {
                console.error("Error during trade request:", error);
            });
    }

    /**
     * Accepts a pending trade request.
     * @param tradeId - The trade ID of the trade request to accept.
     */
    acceptTrade(tradeId: number) {
        const url = `/lol-champ-select/v1/session/trades/${tradeId}/accept`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Trade accepted:", response.content);
                this.fetchAvailableTrades(); // Refresh trades immediately
            })
            .catch(error => {
                console.error("Error accepting trade:", error);
            });
    }

    /**
     * Declines a pending trade request.
     * @param tradeId - The trade ID of the trade request to decline.
     */
    declineTrade(tradeId: number) {
        const url = `/lol-champ-select/v1/session/trades/${tradeId}/decline`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Trade declined:", response.content);
                this.fetchAvailableTrades(); // Refresh trades immediately
            })
            .catch(error => {
                console.error("Error declining trade:", error);
            });
    }

    /**
     * Cancels a trade request that was initiated.
     * @param tradeId - The trade ID of the trade request to cancel.
     */
    cancelTrade(tradeId: number) {
        const url = `/lol-champ-select/v1/session/trades/${tradeId}/cancel`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Trade request canceled:", response.content);
                this.fetchAvailableTrades(); // Refresh trades immediately
            })
            .catch(error => {
                console.error("Error canceling trade:", error);
            });
    }

    // Swap methods
    requestSwap(swapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${swapId}/request`;
        this.$root.request(url, "POST")
            .then(response => {
                if (response.status === 200) {
                    console.log("Swap request sent successfully:", response.content);
                    this.fetchAvailableSwaps();
                } else {
                    console.error("Failed to send swap request:", response);
                }
            })
            .catch(error => console.error("Error during swap request:", error));
    }

    acceptSwap(swapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${swapId}/accept`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Swap accepted:", response.content);
                this.fetchAvailableSwaps();
            })
            .catch(error => console.error("Error accepting swap:", error));
    }

    declineSwap(swapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${swapId}/decline`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Swap declined:", response.content);
                this.fetchAvailableSwaps();
            })
            .catch(error => console.error("Error declining swap:", error));
    }

    cancelSwap(swapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${swapId}/cancel`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Swap request canceled:", response.content);
                this.fetchAvailableSwaps();
            })
            .catch(error => console.error("Error canceling swap:", error));
    }

    /**
     * @returns the background champion splash image for the specified member.
     */
    getBackgroundStyle(member: ChampSelectMember): string {
        const act = this.$parent.getActions(member);
        const champId = (act ? act.championId : 0) || member.championId || member.championPickIntent;
        if (!champId) return "background-color: transparent;";

        const champ = this.$parent.championDetails[champId];
        if (!champ) return "background-color: transparent;";

        const fade = champId === member.championPickIntent ? "opacity: 0.6;" : "";

        // Show skins if everyone has picked.
        if (this.$parent.hasEveryonePicked) {
            return `background-image: url(https://cdn.communitydragon.org/latest/champion/${champ.key}/splash-art/centered/skin/${member.selectedSkinId % 1000}), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${member.selectedSkinId % 1000}.jpg); ${fade}`;
        }

        // Else just show the champs.
        return `background-image: url(https://cdn.communitydragon.org/latest/champion/${champ.key}/splash-art/centered), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg); ${fade}`;
    }

    /**
     * @returns the active overlay animation class for the specified member.
     */
    getActiveOverlayClass(member: ChampSelectMember): string {
        if (!this.state) return "";
        if (this.state.timer.phase !== "BAN_PICK") return "";
        const act = this.$parent.getActions(member);
        if (!act || act.completed) return "";
        return act.type === "ban" ? "banning" : "picking";
    }

    /**
     * @returns the subtext for the specified member.
     */
    getMemberSubtext(member: ChampSelectMember): string {
        if (!this.state) return "";
        let extra = this.state.timer.phase === "PLANNING" && member === this.state.localPlayer ? "Declaring Intent" : "";

        const cur = this.$parent.getActions(member);
        if (cur && !cur.completed && !extra) {
            extra = cur.type === "ban" ? "Banning..." : "Picking...";
        }

        const next = this.$parent.getActions(member, true);
        if (next && !extra) {
            extra = next.type === "ban" ? "Banning Next..." : "Picking Next...";
        }

        if (!member.assignedPosition) return extra;
        return POSITION_NAMES[member.assignedPosition.toUpperCase()] + (extra ? " - " + extra : "");
    }

    /**
     * @returns the URL to the icon for the specified summoner spell id
     */
    getSummonerSpellImage(id: number): string {
        if (!this.$parent.summonerSpellDetails[id]) return "";

        return `https://ddragon.leagueoflegends.com/cdn/${this.$root.ddragonVersion}/img/spell/${this.$parent.summonerSpellDetails[id].id}.png`;
    }
}
