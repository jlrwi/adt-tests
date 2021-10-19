# adt-tests

This package exports a function that will run [JSCheck](https://github.com/jlrwi/JSCheck) tests on a [curried Static Land](https://github.com/jlrwi/curried-static-land) type module to validate its adherence to the [Fantasy Land](https://github.com/fantasyland/fantasy-land) laws for each algebraic data type it implements. The function returns an array of tests that can be passed to JSCheck.

## Syntax

The adt-tests function is called with an object with any of the following properties:

- functor
- alt
- plus
- alternative
- apply
- applicative
- chain
- monad
- ~~chainRec~~
- bifunctor
- extend
- comonad
- profunctor
- foldable
- traversable
- semigroupoid
- category
- contravariant
- filterable
- semigroup
- monoid
- group
- setoid
- ord

Each property value is an object with these properties:
- T: the type module being tested,
- signature: an object containing JSCheck specifiers named for the arguments required by the test
- compare_with: A function taking two curried values and returning `true` if they are equal, or an array of such functions to be used, each for the corresponding test. (optional)
- input: A JSCheck specifier to be used as input for a function-type type value. (optional)
- predicate: A JSCheck predicate to use instead of the default predicate. (optional)

## Usage

    import adtTests from "@jlrwi/adt-tests";
    import jsCheck from "@jlrwi/jscheck";
    
    let jsc = jscheck();   
    
    const test_roster = adt_tests({
        algebra_name: {
            T,
            signature,
            compare_with, (optional)
            input (optional)
        }
    });
    
    test_roster.forEach(jsc.claim);
    jsc.check({
        on_report: log
    });    

## Algebraic tests

### Parameter types
Unless otherwise specified, parameters are typed as follows:
- Letters from "a": values of the type being tested
- Letters from "f": functions which take and return values of the type
- Letters from "u": a value of the type that encapsulates a morphism (function)
- Letters from "x": any value that could be stored in the type being tested

### Parameters by algebra
algebra | parameters
--------|-----------
functor | a, f, g
alt | a, b, c, f
plus | a, f
apply| a, u, v
applicative | a, f, u, x
chain | f, g, u
alternative| a, b, c
monad | a, f, u
bifunctor| a, f, g, h, i
extend | f, g, w
comonad | f, w
profunctor | a, f, g, h, i
foldable | f, u, x
traversable | see [below](#traversable)
semigroupoid | a, b, c
category | a
contravariant | a, f, g
filterable | a, b, f, g
semigroup | a, b, c
monoid | a
group | a
setoid | a, b, c
ord | a, b, c

### traversable
The tests for this algebra require the following parameters:
- `A` and `B` must be functor type modules
- `a` must be a value of type `A`
- `f` is a morphisms (natural transformations) taking a value in functor `A` and returning the same value in functor `B`.
- `g` is a morphism that can act on values of either type `A` or `B`
- `u` is a traversable containing values of type `A` that themselves contain values of type `B` 