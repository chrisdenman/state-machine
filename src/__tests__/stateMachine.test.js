import {describe, expect, it} from '@jest/globals';
import {StateMachine} from "../stateMachine.js";
import {
    IMMUTABLE_EMPTY_MAP,
    IMMUTABLE_EMPTY_SET,
    makeImmutableMap,
    makeImmutableSet,
    Pair
} from "@ceilingcat/collections";

describe(
    "State Machine Tests",
    () => {
        const GOOD_INPUT_SYMBOL = "a";
        const BAD_INPUT_SYMBOL = "?";
        const GOOD_INPUT_ALPHABET = makeImmutableSet(new Set([GOOD_INPUT_SYMBOL]));

        const START_STATE = "<START>";
        const FINAL_STATE = "<FINAL>";
        const UNKNOWN_STATE = "<?>";

        const STATES = makeImmutableSet(new Set([START_STATE, FINAL_STATE]));

        const INITIAL_STATE__START_STATE = START_STATE;
        const INITIAL_STATE__FINAL_STATE = FINAL_STATE;
        const BAD_INITIAL_STATE = UNKNOWN_STATE;

        const TRANSITION_FUNCTION_KEY = new Pair(START_STATE, GOOD_INPUT_SYMBOL);
        const DUPLICATE_FUNCTION_KEY = new Pair(START_STATE, GOOD_INPUT_SYMBOL);
        const GOOD_TRANSITION_FUNCTION = makeImmutableMap(new Map(
            [[TRANSITION_FUNCTION_KEY, FINAL_STATE]]
        ));
        const DUPLICATED_KEY__EQUALS__TRANSITION_FUNCTION = makeImmutableMap(new Map([
            [TRANSITION_FUNCTION_KEY, FINAL_STATE],
            [DUPLICATE_FUNCTION_KEY, FINAL_STATE]
        ]));

        const GOOD_FINAL_STATES = makeImmutableSet(new Set([FINAL_STATE]));
        const BAD_FINAL_STATES = makeImmutableSet(new Set([START_STATE, UNKNOWN_STATE]));

        // noinspection JSCheckFunctionSignatures
        [
            undefined,
            null
        ].forEach((inputAlphabet) =>
            it(
                `Constructing with a ${inputAlphabet} input alphabet generates an error`,
                () => expect(() => new StateMachine(inputAlphabet)).toThrow("Input alphabet is not a Set.")
            )
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with an empty input alphabet generates an error`,
            () => expect(() => new StateMachine(IMMUTABLE_EMPTY_SET)).toThrow("Input alphabet is empty.")
        );

        // noinspection JSCheckFunctionSignatures
        [
            undefined,
            null
        ].forEach((states) =>
            it(
                `Constructing with a ${states} states set generates an error`,
                () => expect(
                    () => new StateMachine(GOOD_INPUT_ALPHABET, states)
                ).toThrow("The 'states' argument must be a Set.")
            )
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with an empty states set generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, IMMUTABLE_EMPTY_SET)
            ).toThrow("The 'states' argument is empty.")
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a states set that does not contain the initial state generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, STATES, BAD_INITIAL_STATE)
            ).toThrow(`The initial state '${BAD_INITIAL_STATE}' is unknown.`)
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a state transition function that is not a Map generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, STATES, INITIAL_STATE__START_STATE, 1)
            ).toThrow("The state transition function is not a Map.")
        );

        // noinspection JSCheckFunctionSignatures
        it.each`
        inputAlphabet   | states        | initialState  | stateTransitionFunction           | errorMessage                 
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${IMMUTABLE_EMPTY_MAP}            | ${"The state transition function is empty."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[0, "0"]]}                     | ${"The current state and input is not a Pair."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("_", "_"), "_"]]}    | ${"The state '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("_", "_"), "0"]]}    | ${"The state '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("_", "a"), "_"]]}    | ${"The state '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("_", "a"), "0"]]}    | ${"The state '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("0", "_"), "_"]]}    | ${"The input '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("0", "_"), "0"]]}    | ${"The input '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("0", "a"), "_"]]}    | ${"The transition state '_' is unknown."}
        ${["a"]}        | ${["0"]}      | ${"0"}        | ${[[new Pair("0", "a"), "_"]]}    | ${"The transition state '_' is unknown."}
        `(
            `Constructing with bad state transition functions generates an error`,
            ({inputAlphabet, states, initialState, stateTransitionFunction, errorMessage}) =>
                expect(
                    () => new StateMachine(
                        new Set(inputAlphabet),
                        new Set(states),
                        initialState,
                        new Map(stateTransitionFunction)
                    )
                ).toThrow(errorMessage)
        );

        it(
            `Construction with duplicated transition function keys generates an error`,
            () => expect(
                () => new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    DUPLICATED_KEY__EQUALS__TRANSITION_FUNCTION
                )
            ).toThrow("Non-deterministic transition function. Entries at indexes '0' and '1'.")
        );

        it(
            `Constructing with unknown final states generates an error`,
            () => expect(
                () => new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION,
                    BAD_FINAL_STATES
                )
            ).toThrow(`Unknown final state '${UNKNOWN_STATE}'.`)
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a startTransitionFunction that is not a function generates an error`,
            () => expect(
                () => new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION,
                    GOOD_FINAL_STATES,
                    0)
            ).toThrow("The start transition function is not a function.")
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a endTransitionFunction that is not a function generates an error`,
            () => expect(
                () => new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION,
                    GOOD_FINAL_STATES,
                    () => {
                    },
                    0
                )
            ).toThrow("The end transition function is not a function.")
        );

        it(
            `That the initialState property is set after construction`,
            () => {
                const initialState = INITIAL_STATE__START_STATE;
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        initialState,
                        GOOD_TRANSITION_FUNCTION
                    ).initialState
                ).toBe(initialState);
            }
        );

        it(
            `That the state property is set to the initialState after construction`,
            () => {
                const initialState = INITIAL_STATE__START_STATE;
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        initialState,
                        GOOD_TRANSITION_FUNCTION
                    ).state
                ).toBe(initialState);
            }
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `That if final states is not a set an error is generated`,
            () => expect(
                () => new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION,
                    IMMUTABLE_EMPTY_MAP
                )).toThrow("The 'finalStates' argument is not a Set.")
        );

        it(
            `That the isInFinalState is reported as false when we do not supply any final states`,
            () =>
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION
                    ).isInFinalState
                ).toBe(false)
        );

        it(
            `That the isInFinalState is reported as false when it should be`,
            () =>
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(false)
        );

        it(
            `That the isInFinalState is reported as false when it should be`,
            () =>
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(false)
        );

        it(
            `That the isInFinalState is reported as true when it should be`,
            () =>
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__FINAL_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(true)
        );

        it(
            `That providing unknown input symbols generates an error`,
            () =>
                expect(
                    () => new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__FINAL_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).provide(BAD_INPUT_SYMBOL)
                ).toThrow(`Unknown input symbol '${BAD_INPUT_SYMBOL}' provided.`)
        );

        it(
            `That providing a known input symbols returns the same state machine`,
            () => {
                const stateMachine = new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION
                );
                expect(stateMachine.provide(GOOD_INPUT_SYMBOL)).toBe(stateMachine);
            }
        );

        it(
            `That 'this' within: start, and end transition handlers, equals the state machine itself.`,
            () => {
                const stateMachine = new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION,
                    IMMUTABLE_EMPTY_SET,
                    function () {
                        expect(this).toBe(stateMachine);
                    },
                    function () {
                        expect(this).toBe(stateMachine);
                    }
                );
                stateMachine.provide(GOOD_INPUT_SYMBOL);
            }
        );

        it(
            `That providing a known input symbols returns the same state machine`,
            () => {
                const INPUT_SYMBOL__a = "a";
                const INPUT_SYMBOL__b = "b";
                const INPUT_SYMBOL__c = "c";

                const STATE__START = "<START>";
                const STATE__MID = "<MID>";
                const STATE__FINAL = "<FINAL>";

                const TRANSITION_FUNCTION = new Map([
                    [new Pair(STATE__START, INPUT_SYMBOL__a), STATE__START],
                    [new Pair(STATE__START, INPUT_SYMBOL__b), STATE__MID],
                    [new Pair(STATE__MID, INPUT_SYMBOL__b), STATE__MID],
                    [new Pair(STATE__MID, INPUT_SYMBOL__a), STATE__FINAL],
                    [new Pair(STATE__MID, INPUT_SYMBOL__c), STATE__START],
                ]);

                const startTransitions = [];
                const startStates = [];

                const endTransitions = [];
                const endStates = [];

                const stateMachine = new StateMachine(
                    new Set([INPUT_SYMBOL__a, INPUT_SYMBOL__b, INPUT_SYMBOL__c]),
                    new Set([STATE__START, STATE__MID, STATE__FINAL]),
                    STATE__START,
                    TRANSITION_FUNCTION,
                    new Set([STATE__FINAL]),
                    function (currentState, inputSymbol, nextState) {
                        startTransitions.push([currentState, inputSymbol, nextState]);
                        startStates.push(this.state);
                    },
                    function (currentState, inputSymbol, previousState) {
                        endTransitions.push([previousState, inputSymbol, currentState]);
                        endStates.push(this.state);
                    }
                );

                stateMachine.provide(INPUT_SYMBOL__a) // start
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__c)   // start
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__a);  // final

                expect(stateMachine.isInFinalState).toBe(true);

                const EXPECTED_STATE_TRANSITION_DATA = [
                    [STATE__START, INPUT_SYMBOL__a, STATE__START],
                    [STATE__START, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__c, STATE__START],
                    [STATE__START, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__a, STATE__FINAL],
                ];

                expect(startTransitions).toEqual(EXPECTED_STATE_TRANSITION_DATA);
                expect(endTransitions).toEqual(EXPECTED_STATE_TRANSITION_DATA);
                expect(startStates).toEqual([
                    STATE__START, STATE__START, STATE__MID, STATE__MID, STATE__START, STATE__MID
                ]);
                expect(endStates).toEqual([
                    STATE__START, STATE__MID, STATE__MID, STATE__START, STATE__MID, STATE__FINAL
                ]);
            }
        );
    }
);
