/*jslint
    fudge
*/

import {
    compose,
    identity
} from "@jlrwi/combinators";
import {
    and,
    or,
    array_concat,
    array_reduce,
    equals
} from "@jlrwi/esfunctions";

// Definitions of tests for each ADT
const functor = [
    {
        name: "Functor: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.map (identity) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Functor: Composition",
        evaluator: function (T) {
            return function ({a, f, g}) {
                const left = T.map (function (x) {
                    return f (g (x));
                }) (a);
                const right = T.map (f) (T.map (g) (a));

                return {left, right};
            };
        }
    }
];

const alt = [
    {
        name: "Alt: Associativity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = T.alt (T.alt (a) (b)) (c);
                const right = T.alt (a) (T.alt (b) (c));
                return {left, right};
            };
        }
    },
    {
        name: "Alt: Distributivity",
        evaluator: function (T) {
            return function ({a, b, f}) {
                const left = T.map (f) (T.alt (a) (b));
                const right = T.alt (T.map (f) (a)) (T.map (f) (b));
                return {left, right};
            };
        }
    }
];

const plus = [
    {
        name: "Plus: Right identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.alt (a) (T.zero ());
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Plus: Left identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.alt (T.zero ()) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Plus: Annihilation",
        evaluator: function (T) {
            return function ({f}) {
                const left = T.map (f) (T.zero ());
                const right = T.zero ();
                return {left, right};
            };
        }
    }
];

// args name order is different than Static Land spec
// different name to avoid conflict with apply combinator
const apply_test = [
    {
        name: "Apply: Composition",
        evaluator: function (T) {
            return function ({a, u, v}) {
                const left = T.ap (
                    T.ap (
                        T.map (function (f) {
                            return function (g) {
                                return function (x) {
                                    return f (g (x));
                                };
                            };
                        }) (u)
                    ) (v)
                ) (a);
                const right = T.ap (u) (T.ap (v) (a));

                return {left, right};
            };
        }
    }
];

const applicative = [
    {
        name: "Applicative: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.ap (T.of (identity)) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Applicative: Homomorphism",
        evaluator: function (T) {
            return function ({f, x}) {
                const left = T.ap (T.of (f)) (T.of (x));
                const right = T.of (f (x));

                return {left, right};
            };
        }
    },
    {
        name: "Applicative: Interchange",
        evaluator: function (T) {
            return function ({x, u}) {
                const left = T.ap (u) (T.of (x));
                const right = T.ap (T.of (function (f) {
                    return f (x);
                })) (u);

                return {left, right};
            };
        }
    }
];

const chain = [
    {
        name: "Chain: Associativity",
        evaluator: function (T) {
            return function ({f, g, u}) {
                const left = T.chain (g) (T.chain (f) (u));
                const right = T.chain (function (x) {
                    return T.chain (g) (f (x));
                }) (u);

                return {left, right};
            };
        }
    }
];

const alternative = [
    {
        name: "Alternative: Distributivity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = T.ap (T.alt (a) (b)) (c);
                const right = T.alt (T.ap (a) (c)) (T.ap (b) (c));
                return {left, right};
            };
        }
    },
    {
        name: "Alternative: Annihilation",
        evaluator: function (T) {
            return function ({c}) {
                const left = T.ap (T.zero ()) (c);
                const right = T.zero ();
                return {left, right};
            };
        }
    }
];

const monad = [
    {
        name: "Monad: Left identity",
        evaluator: function (T) {
            return function ({f, a}) {
                const left = T.chain (f) (T.of (a));
                const right = f (a);
                return {left, right};
            };
        }
    },
    {
        name: "Monad: Right identity",
        evaluator: function (T) {
            return function ({u}) {
                const left = T.chain (T.of) (u);
                const right = u;
                return {left, right};
            };
        }
    }
];

const bifunctor = [
    {
        name: "Bifunctor: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.bimap (identity) (identity) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Bifunctor: Composition",
        evaluator: function (T) {
            return function ({f, g, h, i, a}) {
                const left = T.bimap (function (x) {
                    return f (g (x));
                }) (function (x) {
                    return h (i (x));
                }) (a);
                const right = T.bimap (f) (h) (T.bimap (g) (i) (a));

                return {left, right};
            };
        }
    }
];

const extend = [
    {
        name: "Extend: Associativity",
        evaluator: function (T) {
            return function ({f, g, w}) {
                const left = T.extend (f) (T.extend (g) (w));
                const right = T.extend (function (x) {
                    return f (T.extend (g) (x));
                }) (w);

                return {left, right};
            };
        }
    }
];

const comonad = [
    {
        name: "Comonad: Left Identity",
        evaluator: function (T) {
            return function ({w}) {
                const left = T.extend (T.extract) (w);
                const right = w;
                return {left, right};
            };
        }
    },
    {
        name: "Comonad: Right Identity",
        evaluator: function (T) {
            return function ({f, w}) {
                const left = T.extract (T.extend (f) (w));
                const right = f (w);
                return {left, right};
            };
        }
    }
];

const profunctor = [
    {
        name: "Profunctor: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.promap (identity) (identity) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Profunctor: Composition",
        evaluator: function (T) {
            return function ({f, g, h, i, a}) {
                const left = T.promap (compose (f) (g)) (compose (h) (i)) (a);
                const right = T.promap (g) (h) (
                    T.promap (f) (i) (a)
                );

                return {left, right};
            };
        }
    }
];

const foldable = [
    {
        name: "Foldable",
        evaluator: function (T) {
            return function ({f, x, u}) {
                const left = array_reduce (f) (x) (
                    T.reduce (array_concat) ([]) (u)
                );
                const right = T.reduce (f) (x) (u);

                return {left, right};
            };
        }
    }
];

/*
    A and B must be Functors
    f must be of the form A<a> -> B<a> (a natural transformation)
    a must be of type A
    u must be of the form T<A <B a>>
*/
// Must pass array as compare_with with comparisons to use for each test
const traversable = [

    // f: A<a> -> B<a>
    // a: A<a>
    {
        name: "Traversable: Naturality precondition",
        evaluator: function (ignore) {
            return function ({A, B, f, g, a}) {
                const left = B.map (g) (f (a));
                const right = f (A.map (g) (a));
                return {left, right};
            };
        }
    },

    // u: T<A <a>>
    {
        name: "Traversable: Naturality",
        evaluator: function (T) {
            return function ({A, B, u, f}) {
                const left = f (T.traverse (A) (identity) (u));
                const right = T.traverse (B) (f) (u);
                return {left, right};
            };
        }
    },

    // a: T<a>
    {
        name: "Traversable: Identity",
        evaluator: function (T) {
            return function ({B, u}) {
                const left = T.traverse (B) (B.of) (u);
                const right = B.of (u);
                return {left, right};

            };
        }
    },

    {
        name: "Traversable: Composition",
        evaluator: function (T) {
            const compose_AB_T = function (A) {
                return function (B) {
                    return {
                        of: function (x) {
                            return A.of (B.of (x));
                        },
                        ap: function (a1) {
                            return function (a2) {
                                return A.ap (
                                    A.map (function (b1) {
                                        return function (b2) {
                                            return B.ap (b1) (b2);
                                        };
                                    }) (a1)
                                ) (a2);
                            };
                        },
                        map: function (f) {
                            return function (a) {
                                return A.map (function (b) {
                                    return B.map (f) (b);
                                }) (a);
                            };
                        }
                    };
                };
            };

            return function ({A, B, u}) {
                const left = T.traverse (
                    compose_AB_T (A) (B)
                ) (
                    identity
                ) (
                    u
                );

        // u: T< A< B<a>>>, turns to A< T<B <a>>>
        //    each T<B <a>> gets sent as v, and must be a T<B<a>>
        //    to become a B<T<a>>, resulting in A<B<T<a>>>
                const right = A.map (function (v) {
                    return T.traverse (B) (identity) (v);
                }) (T.traverse (A) (identity) (u));

                return {left, right};
            };
        }
    }
];

const semigroupoid = [
    {
        name: "Semigroupoid: Associativity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = T.compose (T.compose (a) (b)) (c);
                const right = T.compose (a) (T.compose (b) (c));
                return {left, right};
            };
        }
    }
];

const category = [
    {
        name: "Category: Right identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.compose (a) (T.id);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Category: Left identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.compose (T.id) (a);
                const right = a;
                return {left, right};
            };
        }
    }
];

const contravariant = [
    {
        name: "Contravariant: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.contramap (identity) (a);
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Contravariant: Composition",
        evaluator: function (T) {
            return function ({a, f, g}) {
                const left = T.contramap (function (x) {
                    return f (g (x));
                }) (a);
                const right = T.contramap (g) (T.contramap (f) (a));

                return {left, right};
            };
        }
    }
];

const filterable = [
    {
        name: "Filterable: Distributivity",
        evaluator: function (T) {
            return function ({a, f, g}) {
                const left = T.filter (function (x) {
                    return f (x) && g (x);
                }) (a);
                const right = T.filter (f) (T.filter (g) (a));

                return {left, right};
            };
        }
    },
    {
        name: "Filterable: Identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.filter (function (ignore) {
                    return true;
                }) (a);
                const right = a;

                return {left, right};
            };
        }
    },
    {
        name: "Filterable: Annihilation",
        evaluator: function (T) {
            return function ({a, b}) {
                const left = T.filter (function (ignore) {
                    return false;
                }) (a);
                const right = T.filter (function (ignore) {
                    return false;
                }) (b);

                return {left, right};
            };
        }
    }
];

const semigroup = [
    {
        name: "Semigroup: Associativity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = T.concat (T.concat (a) (b)) (c);
                const right = T.concat (a) (T.concat (b) (c));
                return {left, right};
            };
        }
    }
];

const monoid = [
    {
        name: "Monoid: Right identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.concat (a) (T.empty ());
                const right = a;
                return {left, right};
            };
        }
    },
    {
        name: "Monoid: Left identity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.concat (T.empty ()) (a);
                const right = a;
                return {left, right};
            };
        }
    }
];

const group = [
    {
        name: "Group: Right inverse",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.concat (a) (T.invert (a));
                const right = T.empty ();
                return {left, right};
            };
        }
    },
    {
        name: "Group: Left inverse",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.concat (T.invert (a)) (a);
                const right = T.empty ();
                return {left, right};
            };
        }
    }
];

const setoid = [
    {
        name: "Setoid: Reflexivity",
        evaluator: function (T) {
            return function ({a}) {
                const left = T.equals (a) (a);
                const right = true;
                return {left, right};
            };
        },
        compare_with: equals
    },
    {
        name: "Setoid: Symmetry",
        evaluator: function (T) {
            return function ({a, b}) {
                const left = equals (T.equals (a) (b)) (T.equals (b) (a));
                const right = true;
                return {left, right};
            };
        },
        compare_with: equals
    },
    {
        name: "Setoid: Transitivity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = and (T.equals (a) (b)) (T.equals (b) (c));
                const right = (
                    left
                    ? T.equals (a) (c)
                    : false
                );

                return {left, right};
            };
        },
        compare_with: equals
    }
];

const ord = [
    {
        name: "Ord: Totality",
        evaluator: function (T) {
            return function ({a, b}) {
                const left = or (T.lte (a) (b)) (T.lte (b) (a));
                const right = true;
                return {left, right};
            };
        },
        compare_with: equals
    },
    {
        name: "Ord: Antisymmetry",
        evaluator: function (T) {
            return function ({a, b}) {
                const left = and (T.lte (a) (b)) (T.lte (b) (a));
                const right = T.equals (a) (b);
                return {left, right};
            };
        },
        compare_with: equals
    },
    {
        name: "Ord: Transitivity",
        evaluator: function (T) {
            return function ({a, b, c}) {
                const left = and (T.lte (a) (b)) (T.lte (b) (c));
                const right = (
                    left
                    ? T.lte (a) (c)
                    : false
                );

                return {left, right};
            };
        },
        compare_with: equals
    }
];

export default Object.freeze({
    functor,
    alt,
    plus,
    apply: apply_test,
    applicative,
    chain,
    alternative,
    monad,
//    chainRec,
    extend,
    comonad,
    bifunctor,
    profunctor,
    foldable,
    traversable,
    semigroupoid,
    category,
    contravariant,
    filterable,
    semigroup,
    monoid,
    group,
    setoid,
    ord
});