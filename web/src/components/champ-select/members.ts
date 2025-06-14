import Root from "../root/root";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { default as ChampSelect, ChampSelectState, ChampSelectMember } from "./champ-select";
import { POSITION_NAMES } from "@/constants";

interface PickOrderSwap {
    cellId: number;
    id: number;
    state: string;
}

interface RoleSwap {
    cellId: number;
    id: number;
    state: string;
}

interface ChampionSwap {
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

    // Store the pick orders and champion swaps fetched from the API
    pickOrders: PickOrderSwap[] = [];
    roleSwaps: RoleSwap[] = [];
    championSwaps: ChampionSwap[] = [];

    tradeRefreshInterval: number = 500; // Interval in milliseconds
    pollingTimer: number | undefined = undefined;

    mounted() {
        this.startPolling();
    }

    startPolling() {
        this.fetchAvailablePickOrders();
        this.fetchAvailableRoleSwaps();
        this.fetchAvailableChampionSwaps();
        this.pollingTimer = window.setInterval(() => {
        this.fetchAvailablePickOrders();
        this.fetchAvailableRoleSwaps();
        this.fetchAvailableChampionSwaps();
        }, this.tradeRefreshInterval);


    }
    
    /**
     * Fetch available pick orders and store them.
     */
    async fetchAvailablePickOrders() {
        try {
            const response = await this.$root.request("/lol-champ-select/v1/session/pick-order-swaps", "GET");
            if (response.status === 200) {
                this.pickOrders = response.content || [];
                console.log(`FETCH pick orders: ${JSON.stringify(this.pickOrders)}`)
            }
        } catch (error) {
            console.error("Failed to fetch pick orders:", error);
        }
    }

    /**
     * Fetch available role swaps and store them.
     */
    async fetchAvailableRoleSwaps() {
        try {
            const response = await this.$root.request("/lol-champ-select/v1/session/position-swaps", "GET");
            if (response.status === 200) {
                this.roleSwaps = response.content || [];
                console.log(`FETCH role swaps: ${JSON.stringify(this.roleSwaps)}`)
            }
        } catch (error) {
            console.error("Failed to fetch role swaps:", error);
        }
    }

    /**
     * Fetch available champion swaps and store them.
     */
    async fetchAvailableChampionSwaps() {
        try {
            const response = await this.$root.request("/lol-champ-select/v1/session/swaps", "GET");
            if (response.status === 200) {
                this.championSwaps = response.content || [];
                console.log(`FETCH champion swaps: ${JSON.stringify(this.championSwaps)}`);
            }
        } catch (error) {
            console.error("Failed to fetch available champion swaps:", error);
        }
    }

    /**
     * Gets the pick orders associated with a given cellId, if available.
     */
    getPickOrderForMember(cellId: number): PickOrderSwap | null {
        console.log("pick order for member: " + cellId);
        const aa = this.pickOrders.find(po => po.cellId === cellId) || null;
        console.log(this.pickOrders);
        if (aa){
            console.log("PO state:" + aa.state);
            console.log("=====");
        }
        return this.pickOrders.find(po => po.cellId === cellId) || null;
    }

    /**
     * Gets the role swaps associated with a given cellId, if available.
     */
    getRoleSwapForMember(cellId: number): RoleSwap | null {
        return this.roleSwaps.find(rs => rs.cellId === cellId) || null;
    }

    /**
     * Gets the champion associated with a given cellId, if available.
     */
    getChampionSwapForMember(cellId: number): ChampionSwap | null {
        return this.championSwaps.find(cs => cs.cellId === cellId) || null;
    }

    // Pick order swap methods
    requestPickOrderSwap(pickOrderId: number) {
        const url = `/lol-champ-select/v1/session/pick-order-swaps/${pickOrderId}/request`;
        this.$root.request(url, "POST")
            .then(response => {
                if (response.status === 200) {
                    console.log("Pick order swap request sent successfully:", response.content);
                    this.fetchAvailablePickOrders(); // Refresh pick orders immediately
                } else {
                    console.error("Failed to send pick order swap request:", response);
                }
            })
            .catch(error => {
                console.error("Error during pick order swap request:", error);
            });
    }

    acceptPickOrderSwap(pickOrderId: number) {
        const url = `/lol-champ-select/v1/session/pick-order-swaps/${pickOrderId}/accept`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Pick order swap accepted:", response.content);
                this.fetchAvailablePickOrders(); // Refresh pick orders immediately
            })
            .catch(error => {
                console.error("Error accepting pick order swap:", error);
            });
    }

    declinePickOrderSwap(pickOrderId: number) {
        const url = `/lol-champ-select/v1/session/pick-order-swaps/${pickOrderId}/decline`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Pick order swap declined:", response.content);
                this.fetchAvailablePickOrders(); // Refresh pick orders immediately
            })
            .catch(error => {
                console.error("Error declining pick order swap:", error);
            });
    }

    cancelPickOrderSwap(pickOrderId: number) {
        const url = `/lol-champ-select/v1/session/pick-order-swaps/${pickOrderId}/cancel`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Pick order swap request canceled:", response.content);
                this.fetchAvailablePickOrders(); // Refresh pick orders immediately
            })
            .catch(error => {
                console.error("Error canceling pick order swap:", error);
            });
    }

    // Role Swap methods
    requestRoleSwap(roleSwapId: number) {
        const url = `/lol-champ-select/v1/session/position-swaps/${roleSwapId}/request`;
        this.$root.request(url, "POST")
            .then(response => {
                if (response.status === 200) {
                    console.log("role swap request sent successfully:", response.content);
                    this.fetchAvailableRoleSwaps(); // Refresh role swaps immediately
                } else {
                    console.error("Failed to send role swap request:", response);
                }
            })
            .catch(error => {
                console.error("Error during role swap request:", error);
            });
    }

    acceptRoleSwap(roleSwapId: number) {
        const url = `/lol-champ-select/v1/session/position-swaps/${roleSwapId}/accept`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("role swap accepted:", response.content);
                this.fetchAvailableRoleSwaps(); // Refresh role swaps immediately
            })
            .catch(error => {
                console.error("Error accepting role swap:", error);
            });
    }

    declineRoleSwap(roleSwapId: number) {
        const url = `/lol-champ-select/v1/session/position-swaps/${roleSwapId}/decline`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("role swap declined:", response.content);
                this.fetchAvailableRoleSwaps(); // Refresh role swaps immediately
            })
            .catch(error => {
                console.error("Error declining role swap:", error);
            });
    }

    cancelRoleSwap(roleSwapId: number) {
        const url = `/lol-champ-select/v1/session/position-swaps/${roleSwapId}/cancel`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("role swap request canceled:", response.content);
                this.fetchAvailableRoleSwaps(); // Refresh role swaps immediately
            })
            .catch(error => {
                console.error("Error canceling role swap:", error);
            });
    }

    // Champion Swap methods
    requestChampionSwap(championSwapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${championSwapId}/request`;
        this.$root.request(url, "POST")
            .then(response => {
                if (response.status === 200) {
                    console.log("Champion swap request sent successfully:", response.content);
                    this.fetchAvailableChampionSwaps();
                } else {
                    console.error("Failed to send champion swap request:", response);
                }
            })
            .catch(error => console.error("Error during swap request:", error));
    }

    acceptChampionSwap(championSwapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${championSwapId}/accept`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Champion swap accepted:", response.content);
                this.fetchAvailableChampionSwaps();
            })
            .catch(error => console.error("Error accepting champion swap:", error));
    }

    declineChampionSwap(championSwapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${championSwapId}/decline`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Champion swap declined:", response.content);
                this.fetchAvailableChampionSwaps();
            })
            .catch(error => console.error("Error declining champion swap:", error));
    }

    cancelChampionSwap(championSwapId: number) {
        const url = `/lol-champ-select/v1/session/swaps/${championSwapId}/cancel`;
        this.$root.request(url, "POST")
            .then(response => {
                console.log("Champion swap request canceled:", response.content);
                this.fetchAvailableChampionSwaps();
            })
            .catch(error => console.error("Error canceling champion swap:", error));
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
