import {hasAll, IMMUTABLE_EMPTY_SET, Pair} from "@ceilingcat/collections";
import Assertions from "@ceilingcat/assertions";

/**
 * @callback StartTransitionFunction
 *
 * @param {string} currentState - the current state
 * @param {string} input - the input that triggered this transition
 * @param {string} nextState - the next state
 */

/**
 * @callback EndTransitionFunction
 *
 * @param {string} currentState - the current state
 * @param {string} input - the input that triggered this transition
 * @param {string} lastState - the last state
 */

export class StateMachine {

    /**
     * @type {Set<String>}
     */
    #inputAlphabet

    /**
     * @type {String}
     */
    #state

    /**
     * @type {String}
     */
    #initialState

    /**
     * @type {Set<String>}
     */
    #finalStates

    /**
     * @type {Map<Pair<string, string>, string>} stateTransitionFunction
     */
    #stateTransitionFunction

    /**
     * @type {StartTransitionFunction}
     */
    #startTransitionFunction

    /**
     * @type {EndTransitionFunction}
     */
    #endTransitionFunction

    /**
     * Constructs and returns a new deterministic state machine.
     *
     * @param {Set<string>} inputAlphabet - the permissible input alphabet values
     * @param {Set<string>} states - the set of possible states this state machine can take
     * @param {string} initialState - the starting state
     * @param {Map<Pair<string, string>, string>} stateTransitionFunction - a <code>Map</code> from
     * <code>Pair(currentState, inputSymbol)</code> to the next state.
     * @param {Set<string>} finalStates - a collection of final states such that when the state machine is in one of
     * these states, <code>isInFinalState(...)</code> will return <code>true</code>
     * @param {StartTransitionFunction} startTransitionFunction - a callback function that will be called before a
     * state transition occurs (with <code>this</code> being set to the <code>StateMachine</code> object).
     * @param {EndTransitionFunction} endTransitionFunction - a callback function that will be called after a state
     * transition occurs (with <code>this</code> being set to the <code>StateMachine</code> object).
     *
     * @throws Error if 'inputAlphabet' is not a <code>Set</code>
     * @throws Error if 'inputAlphabet' is empty
     * @throws Error if 'states' is not a <code>Set</code>
     * @throws Error if 'states' is empty
     * @throws Error if 'initialState' is not contained in 'states'
     * @throws Error if 'stateTransitionFunction' is not a <code>Map</code>
     * @throws Error if 'stateTransitionFunction' is empty
     * @throws Error if any 'stateTransitionFunction' key is not a <code>Pair</code>
     * @throws Error if any 'stateTransitionFunction' <code>key.first</code> is not a known state
     * @throws Error if any 'stateTransitionFunction' <code>key.second</code> is not contained in 'inputAlphabet'
     * @throws Error if any 'stateTransitionFunction' value is not a known state
     * @throws Error if any two 'stateTransitionFunction' keys are duplicated (either strictly equal or for which
     * <code>key1.equals(key2) === true</code>)
     * @throws Error if any 'finalStates' is not a known state
     * @throws Error if 'startTransitionFunction' is not a <code>Function</code>
     * @throws Error if 'endTransitionFunction' is not a <code>Function</code>
     */
    constructor(
        inputAlphabet,
        states,
        initialState,
        stateTransitionFunction,
        finalStates = IMMUTABLE_EMPTY_SET,
        startTransitionFunction = () => {
        },
        endTransitionFunction = () => {
        }
    ) {
        this.#inputAlphabet = Assertions.isInstanceOf(inputAlphabet, Set)
        Assertions.isTrue(inputAlphabet.size > 0)

        Assertions.isInstanceOf(states, Set)
        Assertions.isTrue(states.size > 0)

        Assertions.isTrue(states.has(initialState))
        this.#state = initialState;
        this.#initialState = initialState;

        Assertions.isInstanceOf(stateTransitionFunction, Map);
        Assertions.isTrue(stateTransitionFunction.size > 0)
        stateTransitionFunction.forEach((value, key) => {
            Assertions.isInstanceOf(key, Pair)
            Assertions.isTrue(states.has(key.first));
            Assertions.isTrue(inputAlphabet.has(key.second));
            Assertions.isTrue(states.has(value));
            stateTransitionFunction.forEach((value1, key1) =>
                Assertions.withGuard(() => key === key1 || !key.equals(key1))
            )
        })
        this.#stateTransitionFunction = new Map(stateTransitionFunction.entries());

        Assertions.isInstanceOf(finalStates, Set);
        Assertions.isTrue(hasAll(states, finalStates))
        this.#finalStates = new Map(finalStates.entries());

        this.#startTransitionFunction = Assertions.isInstanceOf(startTransitionFunction, Function);
        this.#endTransitionFunction = Assertions.isInstanceOf(endTransitionFunction, Function);
    }

    /**
     * Returns this state machine's initial state.
     *
     * @return {string} the initial state
     */
    get initialState() {
        return this.#initialState;
    }

    /**
     * Returns the current state.
     *
     * @return {string} the current state
     */
    get state() {
        return this.#state;
    }


    /**
     * Is the current state a final state?
     *
     * @return {boolean} <code>true</code> if the current state is a final state, <code>false</code> otherwise.
     */
    get isInFinalState() {
        return this.#finalStates.has(this.#state);
    }

    /**
     * Provide an input and possibly transition the state machine.
     * <p>
     * If there is a transition defined for the current state and the given input symbol, the following sequence of
     * events occur:
     * <ol>
     *     <li>the start transition function, if defined, is invoked with (current state, input symbol, next state)</li>
     *     <li>the state machine advances to the next state</li>
     *     <li>the end transition function, if defined, is invoked with (current state, input symbol, next state)</li>
     * </ol>
     *
     * @param inputSymbol {string} - the next symbol that may trigger a state transition
     *
     * @return {StateMachine}
     *
     * @throws Error if the input symbol provided is not a valid input symbol (contained in the 'inputAlphabet' value
     * provided to the constructor)
     */
    provide(inputSymbol) {
        Assertions.isTrue(this.#inputAlphabet.has(inputSymbol))

        const _this = this;
        const stateInputPair = Pair.of(this.#state, inputSymbol);
        this.#stateTransitionFunction.forEach(
            (transitionState, stateAndInput) => {
                if (stateAndInput.equals(stateInputPair)) {
                    const exitArgs = [this.#state, inputSymbol, transitionState];
                    this.#startTransitionFunction.apply(_this, exitArgs);
                    this.#state = transitionState;
                    this.#endTransitionFunction.apply(_this, exitArgs.reverse());
                }
            }
        )

        return this;
    }
}