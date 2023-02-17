import {describe, expect, it} from '@jest/globals';
import {StateMachine} from "../src/stateMachine";
import {Pair, IMMUTABLE_EMPTY_MAP, IMMUTABLE_EMPTY_SET, makeImmutableMap, makeImmutableSet} from "collections";

describe(
    "State Machine Tests",
    () => {
        const GOOD_INPUT_SYMBOL = "a"
        const BAD_INPUT_SYMBOL = "?"
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
                () => expect(() => new StateMachine(inputAlphabet)).toThrowError()
            )
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with an empty input alphabet generates an error`,
            () => expect(() => new StateMachine(IMMUTABLE_EMPTY_SET)).toThrowError()
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
                ).toThrowError()
            )
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with an empty states set generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, IMMUTABLE_EMPTY_SET)
            ).toThrowError()
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a states set that does not contain the initial state generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, STATES, BAD_INITIAL_STATE)
            ).toThrowError()
        );

        // noinspection JSCheckFunctionSignatures
        it(
            `Constructing with a state transition function that is not a Map generates an error`,
            () => expect(
                () => new StateMachine(GOOD_INPUT_ALPHABET, STATES, BAD_INITIAL_STATE, 1)
            ).toThrowError()
        );

        // noinspection JSCheckFunctionSignatures
        it.each`
        inputAlphabet   | states        | initialState  | stateTransitionFunction                 
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${IMMUTABLE_EMPTY_MAP}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[0, "0"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("_", "_"), "_"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("_", "_"), "0"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("_", "a"), "_"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("_", "a"), "0"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("0", "_"), "_"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("0", "_"), "0"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("0", "a"), "_"]]}
        ${["a"]}        | ${["0"]}      | ${"0"}      | ${[[new Pair("0", "a"), "_"]]}
        `(
            `Constructing with bad state transition functions generates an error`,
            ({inputAlphabet, states, initialState, stateTransitionFunction}) =>
                expect(
                    () => new StateMachine(
                        new Set(inputAlphabet),
                        new Set(states),
                        initialState,
                        new Map(stateTransitionFunction)
                    )
                ).toThrowError()
        );

        it(
            `Construction with duplicated transition function keys generates an error`,
            () => {
                expect(
                    () => new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        DUPLICATED_KEY__EQUALS__TRANSITION_FUNCTION
                    )
                ).toThrowError()
            }
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
            ).toThrowError()
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
            ).toThrowError()
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
                    () => {},
                    0
                )
            ).toThrowError()
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
                ).toBe(initialState)
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
                ).toBe(initialState)
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
                )).toThrowError()
        )

        it(
            `That the isInFinalState is reported as false when we do not supply any final states`,
            () => {
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION
                    ).isInFinalState
                ).toBe(false)
            }
        );

        it(
            `That the isInFinalState is reported as false when it should be`,
            () => {
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(false)
            }
        );

        it(
            `That the isInFinalState is reported as false when it should be`,
            () => {
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__START_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(false)
            }
        );

        it(
            `That the isInFinalState is reported as true when it should be`,
            () => {
                expect(
                    new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__FINAL_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).isInFinalState
                ).toBe(true)
            }
        );

        it(
            `That providing unknown input symbols generates an error`,
            () => {
                expect(
                    () => new StateMachine(
                        GOOD_INPUT_ALPHABET,
                        STATES,
                        INITIAL_STATE__FINAL_STATE,
                        GOOD_TRANSITION_FUNCTION,
                        GOOD_FINAL_STATES
                    ).provide(BAD_INPUT_SYMBOL)
                ).toThrowError()
            }
        );

        it(
            `That providing a known input symbols returns the same state machine`,
            () => {
                const stateMachine = new StateMachine(
                    GOOD_INPUT_ALPHABET,
                    STATES,
                    INITIAL_STATE__START_STATE,
                    GOOD_TRANSITION_FUNCTION
                )
                expect(stateMachine.provide(GOOD_INPUT_SYMBOL)).toBe(stateMachine)
            }
        );
        it(
            `That providing a known input symbols returns the same state machine`,
            () => {
                const INPUT_SYMBOL__a = "a"
                const INPUT_SYMBOL__b = "b"
                const INPUT_SYMBOL__c = "c"

                const STATE__START = "<START>";
                const STATE__MID = "<MID>";
                const STATE__FINAL = "<FINAL>";

                const TRANSITION_FUNCTION = new Map([
                    [new Pair(STATE__START, INPUT_SYMBOL__a), STATE__START],
                    [new Pair(STATE__START, INPUT_SYMBOL__b), STATE__MID],
                    [new Pair(STATE__MID, INPUT_SYMBOL__b), STATE__MID],
                    [new Pair(STATE__MID, INPUT_SYMBOL__a), STATE__FINAL],
                    [new Pair(STATE__MID, INPUT_SYMBOL__c), STATE__START],
                ])

                const startTransitions = [];
                const startStates = []

                const endTransitions = [];
                const endStates = []

                const stateMachine = new StateMachine(
                    new Set([INPUT_SYMBOL__a, INPUT_SYMBOL__b, INPUT_SYMBOL__c]),
                    new Set([STATE__START, STATE__MID, STATE__FINAL]),
                    STATE__START,
                    TRANSITION_FUNCTION,
                    new Set([STATE__FINAL]),

                    function(previousState, inputSymbol, nextState) {
                        startTransitions.push([previousState, inputSymbol, nextState]);
                        startStates.push(this.state);
                    },
                    function(previousState, inputSymbol, nextState) {
                        endTransitions.push([previousState, inputSymbol, nextState]);
                        endStates.push(this.state);
                    }
                )

                stateMachine                    // start
                    .provide(INPUT_SYMBOL__a)   // start
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__c)   // start
                    .provide(INPUT_SYMBOL__b)   // mid
                    .provide(INPUT_SYMBOL__a);  // final

                expect(stateMachine.isInFinalState).toBe(true)

                const EXPECTED_STATE_TRANSITION_DATA = [
                    [STATE__START, INPUT_SYMBOL__a, STATE__START],
                    [STATE__START, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__c, STATE__START],
                    [STATE__START, INPUT_SYMBOL__b, STATE__MID],
                    [STATE__MID, INPUT_SYMBOL__a, STATE__FINAL],
                ];

                expect(startTransitions).toEqual(EXPECTED_STATE_TRANSITION_DATA)
                expect(endTransitions).toEqual(EXPECTED_STATE_TRANSITION_DATA)
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
