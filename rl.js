class RLBrain {
    constructor(actions, featureCount) {
        this.actions = actions
        this.alpha = 0.05
        this.gamma = 0.95
        this.epsilon = 1
        this.minEpsilon = 0.05
        this.epsilonDecay = 0.995
        this.featureCount = featureCount
        this.weights = {}
        for (const a of actions) {
            this.weights[a] = new Array(featureCount)
                .fill(0)
                .map(() => Math.random() * 0.1 - 0.05)
        }
    }

    getState(sensorReadings, angle) {
        const features = []
        if (sensorReadings) {
            for (const r of sensorReadings) {
                features.push(r ? 1 - r.offset : 1)
            }
        }
        features.push(Math.sin(angle))
        features.push(Math.cos(angle))
        features.push(1) // bias
        return features
    }

    #dot(w, x) {
        let sum = 0
        for (let i = 0; i < w.length; i++) {
            sum += w[i] * x[i]
        }
        return sum
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            return this.actions[Math.floor(Math.random() * this.actions.length)]
        }
        let best = this.actions[0]
        let bestVal = this.#dot(this.weights[best], state)
        for (const a of this.actions) {
            const val = this.#dot(this.weights[a], state)
            if (val > bestVal) {
                bestVal = val
                best = a
            }
        }
        return best
    }

    update(state, action, reward, nextState) {
        const currentQ = this.#dot(this.weights[action], state)
        let nextQ = this.#dot(this.weights[this.actions[0]], nextState)
        for (const a of this.actions) {
            const val = this.#dot(this.weights[a], nextState)
            if (val > nextQ) nextQ = val
        }
        const target = reward + this.gamma * nextQ
        const error = target - currentQ
        for (let i = 0; i < this.featureCount; i++) {
            this.weights[action][i] += this.alpha * error * state[i]
        }
    }

    endEpisode() {
        this.epsilon = Math.max(
            this.minEpsilon,
            this.epsilon * this.epsilonDecay
        )
    }
}
