class RLBrain {
    constructor(actions) {
        this.qTable = {}
        this.actions = actions
        this.alpha = 0.1
        this.gamma = 0.95
        this.epsilon = 0.1
    }

    getState(sensorReadings) {
        if (!sensorReadings) return 'null'
        return sensorReadings
            .map((s) => (s && s.offset < 0.5 ? 1 : 0))
            .join('')
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon || !this.qTable[state]) {
            return this.actions[Math.floor(Math.random() * this.actions.length)]
        }
        const qvals = this.qTable[state]
        let best = this.actions[0]
        let bestVal = qvals[best] || 0
        for (const a of this.actions) {
            const val = qvals[a] || 0
            if (val > bestVal) {
                bestVal = val
                best = a
            }
        }
        return best
    }

    update(state, action, reward, nextState) {
        if (!this.qTable[state]) this.qTable[state] = {}
        if (!this.qTable[state][action]) this.qTable[state][action] = 0

        const nextQ = this.qTable[nextState] || {}
        const nextMax = Math.max(
            ...this.actions.map((a) => nextQ[a] || 0)
        )
        this.qTable[state][action] =
            (1 - this.alpha) * this.qTable[state][action] +
            this.alpha * (reward + this.gamma * nextMax)
    }
}
