/*jslint
    fudge
*/

import {
    ap,
    compose,
    flip,
    pipeN,
    converge
} from "@jlrwi/combinators";
import {
    array_concat,
    array_map,
    array_reduce,
    array_zip,
    prop,
    not,
    equals,
    object_concat,
    object_map,
    type_check
} from "@jlrwi/esfunctions";
import test_definitions from "./tests.js";

const prop_of = flip(prop);
const array_flatten = array_reduce(array_concat)([]);

// Return the first non-undefined value from the parameters
const first_value = function (...values) {
    return values.find(
        compose(not)(equals(undefined))
    );
};

// JSCheck wraps specifier results in a function - this strips the function
// wrapper off
const resolve_object = object_map (function (val) {
    return (
        type_check("function")(val)
        ? val()
        : val
    );
});

// Run a comparison test producing a boolean result
// Optional input invokes left and right if they are functions
// verdict -> {} -> verdict(boolean)
const default_predicate = function (verdict) {
    return function ({left, right, compare_with, input}) {

        let result_left;
        let result_right;

// The usual behavior except when left and right are functions
        if (input === undefined) {

            result_left = left;
            result_right = right;

        } else {

// Strip any function wrapper
            if (type_check("function")(input)) {
                input = input();
            }

            result_left = left(input);
            result_right = right(input);
        }

// lose the test if either result undefined
        if ((result_left === undefined) || (result_right === undefined)) {
            return;
        }

        return verdict(compare_with(result_left)(result_right));
    };
};

// Takes a test spec object, a test specifier function, and specifier
// and returns a test object
// compare_with first choice is from test, next from test spec object
// {spec} -> (T->args->{left, right}) -> {args}-> {test obj}
const test_prep = function ({T, compare_with, input}) {
    return function (test) {
        return pipeN(
            resolve_object,
            test.evaluator (T),
            object_concat ({
                compare_with: first_value (
                    test.compare_with,
                    compare_with,
                    T.equals,
                    equals
                ),
                input
            })
        );
    };
};

// Takes
// first: array of test spec objects, each with name and an evaluator function,
// second: test configuration object with inputs for the evaluator function,
// returns an array of JSCheck test objects
//[{name, T -> args_obj] -> {} -> [{}]
const test_builder = function (test_list) {

//{T, {signature_object}, compare_with, input, predicate}
    return function (test_config) {

// test_config can specify a custom predicate
        const test_predicate = (
            (test_config.predicate === undefined)
            ? default_predicate
            : test_config.predicate
        );

// /{name, T -> args_obj} -> {jscheck test object}
        const test_mapper = function (test) {

// feed the predicate processed test components
            const predicate_mapper = function (predicate) {
                return function (verdict) {
                    return compose (
                        predicate (verdict)
                    ) (
                        test_prep (test_config) (test)
                    );
                };
            };

            return {
                name: test.name,
                predicate: predicate_mapper (test_predicate),
                signature: [test_config.signature]
            };
        };

        const compare_zipper = function (test) {
            return function (compare_with) {
                return object_concat (test) ({compare_with});
            };
        };

// if compare_with is an array, need to use matching comparison for each test.
// Add the comparison to each test object before mapping.
        return array_map (test_mapper) (
            Array.isArray(test_config.compare_with)
            ? array_zip (compare_zipper) (test_list) (test_config.compare_with)
            : test_list
        );
    };
};

// Dictionary of functions waiting for a spec object and returning an
// array of JSCheck inputs
// Result: {a -> [b]}
const tests = object_map (test_builder) (test_definitions);

/*
Function
    from dictionary of test specification objects
    to a two-deep array of JSCheck inputs
*/
// {a} -> [[b]]
const spec_mapper = converge(
    array_map
)(
// mapping function
// takes key and sends corresponding spec object to corresponding test function
// key -> [{b}]
    compose (ap (prop_of (tests))) (prop_of)
)(
    Object.keys
);

/*
Function
    from dictionary of test specification objects
    {test: {T, signature, compare_with, input, predicate}}

    to array of JSCheck inputs
    [{name, predicate, signature}]
*/
// {{a}} -> [{b}]
export default Object.freeze(
    compose(array_flatten)(spec_mapper)
);