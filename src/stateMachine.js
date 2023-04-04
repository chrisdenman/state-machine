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
     * @throws Error if any two 'stateTransitionFunction' keys are duplicated
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
        this.#inputAlphabet = Assertions.isInstanceOf(inputAlphabet, Set, "Input alphabet is not a Set.");
        Assertions.isTrue(inputAlphabet.size > 0, "Input alphabet is empty.");

        Assertions.isInstanceOf(states, Set, "The 'states' argument must be a Set.");
        Assertions.isTrue(states.size > 0, "The 'states' argument is empty.");

        Assertions.isTrue(states.has(initialState), `The initial state '${initialState}' is unknown.`);
        this.#state = initialState;
        this.#initialState = initialState;

        Assertions.isInstanceOf(
            stateTransitionFunction,
            Map,
            "The state transition function is not a Map."
        );

        Assertions.isTrue(
            stateTransitionFunction.size > 0,
            "The state transition function is empty."
        );

        stateTransitionFunction.forEach((transitionState, currentStateAndInput) => {
            Assertions.isInstanceOf(
                currentStateAndInput,
                Pair,
                "The current state and input is not a Pair."
            );
            Assertions.isTrue(
                states.has(currentStateAndInput.first),
                `The state '${currentStateAndInput.first}' is unknown.`
            );
            Assertions.isTrue(
                inputAlphabet.has(currentStateAndInput.second),
                `The input '${currentStateAndInput.second}' is unknown.`
            );
            Assertions.isTrue(
                states.has(transitionState),
                `The transition state '${transitionState}' is unknown.`
            );
        });

        [...stateTransitionFunction.keys()].map((currentStateAndInput0, index0) =>
            [...stateTransitionFunction.keys()].map((currentStateAndInput1, index1) =>
                Assertions.isTrue(
                    !(index0 !== index1 && currentStateAndInput0.equals(currentStateAndInput1)),
                    `Non-deterministic transition function. Entries at indexes '${index0}' and '${index1}'.`
                )
            )
        );

        this.#stateTransitionFunction = new Map(stateTransitionFunction.entries());

        Assertions.isInstanceOf(finalStates, Set, "The 'finalStates' argument is not a Set.");

        finalStates.forEach(finalState =>
            Assertions.isTrue(states.has(finalState), `Unknown final state '${finalState}'.`)
        )

        Assertions.isTrue(hasAll(states, finalStates));
        this.#finalStates = new Map(finalStates.entries());

        this.#startTransitionFunction = Assertions.isInstanceOf(
            startTransitionFunction,
            Function,
            "The start transition function is not a function."
        );
        this.#endTransitionFunction = Assertions.isInstanceOf(
            endTransitionFunction,
            Function,
            "The end transition function is not a function."
        );
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
        Assertions.isTrue(
            this.#inputAlphabet.has(inputSymbol),
            `Unknown input symbol '${inputSymbol}' provided.`
        );

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
        );

        return this;
    }
}