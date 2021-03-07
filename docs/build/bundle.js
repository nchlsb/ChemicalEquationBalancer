
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function map(map, f) {
        let retVal = new Map();
        map.forEach((value, key) => {
            retVal.set(key, f(value));
        });
        return retVal;
    }
    function filter(map, predicate) {
        let retVal = new Map();
        map.forEach((value, key) => {
            if (predicate(value)) {
                retVal.set(key, value);
            }
        });
        return retVal;
    }
    function difference(a, b) {
        const allKeys = new Set([...a.keys(), ...b.keys()]);
        let map = new Map();
        for (let key of allKeys.values()) {
            map.set(key, (a.get(key) || 0) - (b.get(key) || 0));
        }
        return map; //filter(map, v => v !== 0)
    }
    function toString(map) {
        return `{ ${[...map.entries()].map(([k, v]) => `${k}: ${v}`).join(', ')} }`;
    }
    function merge(maps) {
        let retVal = new Map();
        maps.forEach(map => {
            map.forEach((value, key) => {
                retVal.set(key, value + (retVal.get(key) || 0));
            });
        });
        return retVal;
    }

    function makeCompound(molecules, subscript = 1) {
        return {
            kind: 'Compound',
            molecules,
            subscript: subscript
        };
    }
    function makeElement(element, subscript = 1) {
        return {
            kind: 'Element',
            element,
            subscript: subscript
        };
    }
    function H_2O() {
        return makeCompound([makeElement('H', 2), makeElement('O')]);
    }
    // ? H_2 + ? O_2 -->  ? H_2O
    // 1 H_2 + 1 O_2 ---> 1 H_2O
    // ...
    // 2 H_2 + 1 O_2 --> 2 H_2O
    function equationWithCoefficient1(reactants, products) {
        return {
            // [number, Molecule][] = Molecule[]    <====> [number, Molecule] = Molecule
            reactants: reactants.map(reactant => [1, reactant]),
            products: products.map(product => [1, product])
        };
    }
    function isBalanced(equation) {
        return findImbalance(equation).size === 0;
    }
    // map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
    // map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
    // map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
    // map :: (a -> b) -> F<a> -> F<b>
    // 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
    // H: 4
    // O: 2
    function countElements(molecule, coefficient = 1) {
        switch (molecule.kind) {
            case "Element":
                return map(new Map([[molecule.element, molecule.subscript]]), v => v * coefficient);
            case "Compound":
                return map(merge(molecule.molecules.map(innerMolecule => countElements(innerMolecule))), v => v * molecule.subscript * coefficient);
        }
    }
    // Map Law !!
    // map(map(xs, f), g) === map(xs, g . f)
    // xs.map(f).map(g) === xs.map(x => g(f(x)))
    function findImbalance(equation) {
        const reactantsCount = merge(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)));
        const productsCount = merge(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)));
        return filter(difference(reactantsCount, productsCount), elementCount => elementCount !== 0);
    }
    const examples = [
        equationWithCoefficient1([
            makeElement('H', 2),
            makeElement('O', 2)
        ], [
            H_2O()
        ]),
        equationWithCoefficient1([
            makeCompound([
                makeElement('C'),
                makeElement('O', 2)
            ]),
            H_2O()
        ], [
            makeCompound([
                makeElement('C', 6),
                makeElement('H', 12),
                makeElement('O', 6)
            ]),
            makeElement('O', 2)
        ]),
        equationWithCoefficient1([
            makeCompound([
                makeElement('H', 2),
                makeElement('S'),
                makeElement('O', 4)
            ]),
            makeCompound([
                makeElement('H'),
                makeElement('I')
            ])
        ], [
            makeCompound([makeElement('H', 2), makeElement('S')]),
            makeElement('I', 2),
            H_2O()
        ])
    ];
    function randomEquation() {
        return examples[randomIntegerUpTo(examples.length)];
    }
    function randomIntegerUpTo(max) {
        const between0and1 = Math.random();
        const floatBetween0andMax = between0and1 * max;
        return Math.floor(floatBetween0andMax);
    }
    // CO2 + H2O → C6H12O6 + O2
    // SiCl4 + H2O → H4SiO4 + HCl
    // Al + HCl → AlCl3 + H2
    // Na2CO3 + HCl → NaCl + H2O + CO2
    // C7H6O2 + O2 → CO2 + H2O
    // Fe2(SO4)3 + KOH → K2SO4 + Fe(OH)3
    // Ca(PO4)2 + SiO2 → P4O10 + CaSiO3
    // KClO3 → KClO4 + KCl
    // Al2(SO4)3 + Ca(OH)2 → Al(OH)3 + CaSO4
    // H2SO4 + HI → H2S + I2 + H2O

    /* src\App.svelte generated by Svelte v3.32.3 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][0];
    	child_ctx[7] = list[i][1];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][0];
    	child_ctx[7] = list[i][1];
    	child_ctx[10] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (28:1) {#each equation.reactants as [coefficient, molecule], index}
    function create_each_block_1(ctx) {
    	let p;
    	let input;
    	let t0;
    	let t1_value = toString$1(/*molecule*/ ctx[7]) + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[2].call(input, /*each_value_1*/ ctx[10], /*index*/ ctx[9]);
    	}

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[3](/*index*/ ctx[9], /*molecule*/ ctx[7], ...args);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			add_location(input, file, 28, 5, 1076);
    			add_location(p, file, 28, 2, 1073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, input);
    			set_input_value(input, /*coefficient*/ ctx[6]);
    			append_dev(p, t0);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(input, "input", input_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*equation*/ 2 && to_number(input.value) !== /*coefficient*/ ctx[6]) {
    				set_input_value(input, /*coefficient*/ ctx[6]);
    			}

    			if (dirty & /*equation*/ 2 && t1_value !== (t1_value = toString$1(/*molecule*/ ctx[7]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(28:1) {#each equation.reactants as [coefficient, molecule], index}",
    		ctx
    	});

    	return block;
    }

    // (45:1) {#each equation.products as [coefficient, molecule], index}
    function create_each_block(ctx) {
    	let p;
    	let input;
    	let t0;
    	let t1_value = toString$1(/*molecule*/ ctx[7]) + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[4].call(input, /*each_value*/ ctx[8], /*index*/ ctx[9]);
    	}

    	function input_handler_1(...args) {
    		return /*input_handler_1*/ ctx[5](/*index*/ ctx[9], /*molecule*/ ctx[7], ...args);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			add_location(input, file, 45, 5, 1497);
    			add_location(p, file, 45, 2, 1494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, input);
    			set_input_value(input, /*coefficient*/ ctx[6]);
    			append_dev(p, t0);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler_1),
    					listen_dev(input, "input", input_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*equation*/ 2 && to_number(input.value) !== /*coefficient*/ ctx[6]) {
    				set_input_value(input, /*coefficient*/ ctx[6]);
    			}

    			if (dirty & /*equation*/ 2 && t1_value !== (t1_value = toString$1(/*molecule*/ ctx[7]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:1) {#each equation.products as [coefficient, molecule], index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = toString(findImbalance(/*equation*/ ctx[1])) + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = isBalanced(/*equation*/ ctx[1]) + "";
    	let t5;
    	let t6;
    	let h1;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let p2;
    	let t11;
    	let a;
    	let t13;
    	let each_value_1 = /*equation*/ ctx[1].reactants;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*equation*/ ctx[1].products;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = text("\r\n\t-->\r\n\t\r\n\t");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Is balanced: ");
    			t5 = text(t5_value);
    			t6 = space();
    			h1 = element("h1");
    			t7 = text("Hello ");
    			t8 = text(/*name*/ ctx[0]);
    			t9 = text("!");
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t13 = text(" to learn how to build Svelte apps.");
    			add_location(p0, file, 60, 1, 1829);
    			add_location(p1, file, 63, 1, 1884);
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file, 67, 1, 1938);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file, 68, 14, 1976);
    			add_location(p2, file, 68, 1, 1963);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 25, 0, 980);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(main, null);
    			}

    			append_dev(main, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(p0, t2);
    			append_dev(main, t3);
    			append_dev(main, p1);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(main, t6);
    			append_dev(main, h1);
    			append_dev(h1, t7);
    			append_dev(h1, t8);
    			append_dev(h1, t9);
    			append_dev(main, t10);
    			append_dev(main, p2);
    			append_dev(p2, t11);
    			append_dev(p2, a);
    			append_dev(p2, t13);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toString, equation, replaceAtIndex, parseInt*/ 2) {
    				each_value_1 = /*equation*/ ctx[1].reactants;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(main, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*toString, equation, replaceAtIndex, parseInt*/ 2) {
    				each_value = /*equation*/ ctx[1].products;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*equation*/ 2 && t2_value !== (t2_value = toString(findImbalance(/*equation*/ ctx[1])) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*equation*/ 2 && t5_value !== (t5_value = isBalanced(/*equation*/ ctx[1]) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*name*/ 1) set_data_dev(t8, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function replaceAtIndex(array, index, value) {
    	let retVal = new Array();

    	for (let i = 0; i < array.length; i++) {
    		retVal[i] = i === index ? value : array[i];
    	}

    	return retVal;
    }

    function toString$1(molecule) {
    	switch (molecule.kind) {
    		case "Element":
    			return molecule.subscript === 1
    			? `${molecule.element}`
    			: `${molecule.element}_${molecule.subscript}`;
    		case "Compound":
    			return molecule.subscript === 1
    			? `${molecule.molecules.map(molecule => toString$1(molecule)).join("")}`
    			: `(${molecule.molecules.map(molecule => toString$1(molecule)).join("")})_${molecule.subscript}`;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	
    	let { name } = $$props;
    	let equation = randomEquation();
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value_1, index) {
    		each_value_1[index][0] = to_number(this.value);
    		$$invalidate(1, equation);
    	}

    	const input_handler = (index, molecule, event) => {
    		$$invalidate(1, equation = {
    			reactants: replaceAtIndex(equation.reactants, index, [parseInt(event.currentTarget.value), molecule]),
    			products: equation.products
    		});
    	};

    	function input_input_handler_1(each_value, index) {
    		each_value[index][0] = to_number(this.value);
    		$$invalidate(1, equation);
    	}

    	const input_handler_1 = (index, molecule, event) => {
    		$$invalidate(1, equation = {
    			products: replaceAtIndex(equation.products, index, [parseInt(event.currentTarget.value), molecule]),
    			reactants: equation.reactants
    		});
    	};

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		countElements,
    		findImbalance,
    		isBalanced,
    		randomEquation,
    		toStringMap: toString,
    		subscribe,
    		name,
    		equation,
    		replaceAtIndex,
    		toString: toString$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("equation" in $$props) $$invalidate(1, equation = $$props.equation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		equation,
    		input_input_handler,
    		input_handler,
    		input_input_handler_1,
    		input_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
