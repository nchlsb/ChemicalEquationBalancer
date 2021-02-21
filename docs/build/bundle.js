
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    function makeMolecule(molecules, subscript) {
        return {
            kind: 'List',
            molecules,
            subscript: subscript || 1
        };
    }
    function makeElement(element, subscript) {
        return {
            kind: 'Element',
            element,
            subscript: subscript || 1
        };
    }
    function isBalanced(equation) {
        const reactanctsElements = equation.reactants.map(([coefficient, molecule]) => map(countElements(molecule), element => element * coefficient));
        const productsElements = equation.products.map(([coefficient, molecule]) => map(countElements(molecule), element => element * coefficient));
        return mapEquals(merge(reactanctsElements), merge(productsElements));
    }
    function mapEquals(a, b) {
        return isSubset(a, b) && isSubset(b, a);
    }
    // a = {'brett': 20, 'nick': 30}
    // b = {'brett': 20, 'nick': 30, 'cal': 40}
    function isSubset(a, b) {
        for (let key of a.keys()) {
            if (!b.has(key) || a.get(key) !== b.get(key))
                return false;
        }
        return true;
    }
    // map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
    // map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
    // map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
    // map :: (a -> b) -> F<a> -> F<b>
    // 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
    // H: 4
    // O: 2
    function countElements(molecule) {
        switch (molecule.kind) {
            case "Element":
                return new Map([[molecule.element, molecule.subscript]]);
            case "List":
                return map(merge(molecule.molecules.map(innerMolecule => countElements(innerMolecule))), v => v * molecule.subscript);
        }
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
    function map(map, f) {
        let retVal = new Map();
        map.forEach((value, key) => {
            retVal.set(key, f(value));
        });
        return retVal;
    }

    /* src\App.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;

    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i][0];
    	child_ctx[15] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i][0];
    	child_ctx[15] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i][0];
    	child_ctx[15] = list[i][1];
    	return child_ctx;
    }

    // (24:2) {#each [...elementsOfH2.entries()] as [key, value]}
    function create_each_block_2(ctx) {
    	let li;
    	let t0_value = /*key*/ ctx[14] + "";
    	let t0;
    	let t1;
    	let t2_value = /*value*/ ctx[15] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" --> ");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(li, file, 24, 3, 864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elementsOfH2*/ 16 && t0_value !== (t0_value = /*key*/ ctx[14] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*elementsOfH2*/ 16 && t2_value !== (t2_value = /*value*/ ctx[15] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(24:2) {#each [...elementsOfH2.entries()] as [key, value]}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#each [...elementsOfO2.entries()] as [key, value]}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*key*/ ctx[14] + "";
    	let t0;
    	let t1;
    	let t2_value = /*value*/ ctx[15] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" --> ");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(li, file, 32, 3, 989);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elementsOfO2*/ 32 && t0_value !== (t0_value = /*key*/ ctx[14] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*elementsOfO2*/ 32 && t2_value !== (t2_value = /*value*/ ctx[15] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(32:2) {#each [...elementsOfO2.entries()] as [key, value]}",
    		ctx
    	});

    	return block;
    }

    // (40:2) {#each [...elementsOfH2O.entries()] as [key, value]}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*key*/ ctx[14] + "";
    	let t0;
    	let t1;
    	let t2_value = /*value*/ ctx[15] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" --> ");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(li, file, 40, 3, 1115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elementsOfH2O*/ 64 && t0_value !== (t0_value = /*key*/ ctx[14] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*elementsOfH2O*/ 64 && t2_value !== (t2_value = /*value*/ ctx[15] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:2) {#each [...elementsOfH2O.entries()] as [key, value]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let input2;
    	let t2;
    	let ul0;
    	let t3;
    	let ul1;
    	let t4;
    	let ul2;
    	let t5;
    	let button;
    	let t7;
    	let p0;
    	let t8;

    	let t9_value = isBalanced({
    		reactants: [
    			[/*h2Coefficient*/ ctx[1], /*h2*/ ctx[7]],
    			[/*o2Coefficient*/ ctx[2], /*o2*/ ctx[8]]
    		],
    		products: [[/*h2oCoefficient*/ ctx[3], /*h2o*/ ctx[9]]]
    	}) + "";

    	let t9;
    	let t10;
    	let h1;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let p1;
    	let t15;
    	let a;
    	let t17;
    	let mounted;
    	let dispose;
    	let each_value_2 = [.../*elementsOfH2*/ ctx[4].entries()];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = [.../*elementsOfO2*/ ctx[5].entries()];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = [.../*elementsOfH2O*/ ctx[6].entries()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			input0 = element("input");
    			t0 = text("H_2 + ");
    			input1 = element("input");
    			t1 = text("O_2\r\n\t-->\r\n\t");
    			input2 = element("input");
    			t2 = text("H_2O\r\n\r\n\t");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			button = element("button");
    			button.textContent = "Brett";
    			t7 = space();
    			p0 = element("p");
    			t8 = text("Is balanced: ");
    			t9 = text(t9_value);
    			t10 = space();
    			h1 = element("h1");
    			t11 = text("Hello ");
    			t12 = text(/*name*/ ctx[0]);
    			t13 = text("!");
    			t14 = space();
    			p1 = element("p");
    			t15 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t17 = text(" to learn how to build Svelte apps.");
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 18, 1, 628);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file, 18, 55, 682);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file, 20, 1, 742);
    			add_location(ul0, file, 22, 1, 800);
    			add_location(ul1, file, 30, 1, 925);
    			add_location(ul2, file, 38, 1, 1050);
    			add_location(button, file, 47, 1, 1178);
    			add_location(p0, file, 53, 1, 1420);
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file, 60, 1, 1573);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file, 61, 14, 1611);
    			add_location(p1, file, 61, 1, 1598);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 17, 0, 619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input0);
    			set_input_value(input0, /*h2Coefficient*/ ctx[1]);
    			append_dev(main, t0);
    			append_dev(main, input1);
    			set_input_value(input1, /*o2Coefficient*/ ctx[2]);
    			append_dev(main, t1);
    			append_dev(main, input2);
    			set_input_value(input2, /*h2oCoefficient*/ ctx[3]);
    			append_dev(main, t2);
    			append_dev(main, ul0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, ul1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			append_dev(main, t4);
    			append_dev(main, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}

    			append_dev(main, t5);
    			append_dev(main, button);
    			append_dev(main, t7);
    			append_dev(main, p0);
    			append_dev(p0, t8);
    			append_dev(p0, t9);
    			append_dev(main, t10);
    			append_dev(main, h1);
    			append_dev(h1, t11);
    			append_dev(h1, t12);
    			append_dev(h1, t13);
    			append_dev(main, t14);
    			append_dev(main, p1);
    			append_dev(p1, t15);
    			append_dev(p1, a);
    			append_dev(p1, t17);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    					listen_dev(button, "click", /*click_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*h2Coefficient*/ 2 && to_number(input0.value) !== /*h2Coefficient*/ ctx[1]) {
    				set_input_value(input0, /*h2Coefficient*/ ctx[1]);
    			}

    			if (dirty & /*o2Coefficient*/ 4 && to_number(input1.value) !== /*o2Coefficient*/ ctx[2]) {
    				set_input_value(input1, /*o2Coefficient*/ ctx[2]);
    			}

    			if (dirty & /*h2oCoefficient*/ 8 && to_number(input2.value) !== /*h2oCoefficient*/ ctx[3]) {
    				set_input_value(input2, /*h2oCoefficient*/ ctx[3]);
    			}

    			if (dirty & /*elementsOfH2*/ 16) {
    				each_value_2 = [.../*elementsOfH2*/ ctx[4].entries()];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*elementsOfO2*/ 32) {
    				each_value_1 = [.../*elementsOfO2*/ ctx[5].entries()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*elementsOfH2O*/ 64) {
    				each_value = [.../*elementsOfH2O*/ ctx[6].entries()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*h2Coefficient, o2Coefficient, h2oCoefficient*/ 14 && t9_value !== (t9_value = isBalanced({
    				reactants: [
    					[/*h2Coefficient*/ ctx[1], /*h2*/ ctx[7]],
    					[/*o2Coefficient*/ ctx[2], /*o2*/ ctx[8]]
    				],
    				products: [[/*h2oCoefficient*/ ctx[3], /*h2o*/ ctx[9]]]
    			}) + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*name*/ 1) set_data_dev(t12, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	
    	let { name } = $$props;
    	let h2Coefficient = 1;
    	let o2Coefficient = 1;
    	let h2oCoefficient = 1;
    	const h2 = makeElement("H", 2);
    	const o2 = makeElement("O", 2);
    	const h2o = makeMolecule([makeElement("H", 2), makeElement("O")]);
    	let elementsOfH2;
    	let elementsOfO2;
    	let elementsOfH2O;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		h2Coefficient = to_number(this.value);
    		$$invalidate(1, h2Coefficient);
    	}

    	function input1_input_handler() {
    		o2Coefficient = to_number(this.value);
    		$$invalidate(2, o2Coefficient);
    	}

    	function input2_input_handler() {
    		h2oCoefficient = to_number(this.value);
    		$$invalidate(3, h2oCoefficient);
    	}

    	const click_handler = () => {
    		console.log(map(countElements(h2), v => v * h2Coefficient));
    		console.log(map(countElements(o2), v => v * o2Coefficient));
    		console.log(map(countElements(h2o), v => v * h2oCoefficient));
    	};

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		countElements,
    		isBalanced,
    		makeElement,
    		makeMolecule,
    		map,
    		name,
    		h2Coefficient,
    		o2Coefficient,
    		h2oCoefficient,
    		h2,
    		o2,
    		h2o,
    		elementsOfH2,
    		elementsOfO2,
    		elementsOfH2O
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("h2Coefficient" in $$props) $$invalidate(1, h2Coefficient = $$props.h2Coefficient);
    		if ("o2Coefficient" in $$props) $$invalidate(2, o2Coefficient = $$props.o2Coefficient);
    		if ("h2oCoefficient" in $$props) $$invalidate(3, h2oCoefficient = $$props.h2oCoefficient);
    		if ("elementsOfH2" in $$props) $$invalidate(4, elementsOfH2 = $$props.elementsOfH2);
    		if ("elementsOfO2" in $$props) $$invalidate(5, elementsOfO2 = $$props.elementsOfO2);
    		if ("elementsOfH2O" in $$props) $$invalidate(6, elementsOfH2O = $$props.elementsOfH2O);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*h2Coefficient*/ 2) {
    			$$invalidate(4, elementsOfH2 = map(countElements(h2), v => v * h2Coefficient));
    		}

    		if ($$self.$$.dirty & /*o2Coefficient*/ 4) {
    			$$invalidate(5, elementsOfO2 = map(countElements(o2), v => v * o2Coefficient));
    		}

    		if ($$self.$$.dirty & /*h2oCoefficient*/ 8) {
    			$$invalidate(6, elementsOfH2O = map(countElements(h2o), v => v * h2oCoefficient));
    		}
    	};

    	return [
    		name,
    		h2Coefficient,
    		o2Coefficient,
    		h2oCoefficient,
    		elementsOfH2,
    		elementsOfO2,
    		elementsOfH2O,
    		h2,
    		o2,
    		h2o,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler
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
    			console_1.warn("<App> was created without expected prop 'name'");
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
