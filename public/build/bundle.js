
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function empty() {
        return text('');
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
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
        const prop_values = options.props || {};
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.20.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (207:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*componentParams*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(207:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function wrap(route, userData, ...conditions) {
    	// Check if we don't have userData
    	if (userData && typeof userData == "function") {
    		conditions = conditions && conditions.length ? conditions : [];
    		conditions.unshift(userData);
    		userData = undefined;
    	}

    	// Parameter route and each item of conditions must be functions
    	if (!route || typeof route != "function") {
    		throw Error("Invalid parameter route");
    	}

    	if (conditions && conditions.length) {
    		for (let i = 0; i < conditions.length; i++) {
    			if (!conditions[i] || typeof conditions[i] != "function") {
    				throw Error("Invalid parameter conditions[" + i + "]");
    			}
    		}
    	}

    	// Returns an object that contains all the functions to execute too
    	const obj = { route, userData };

    	if (conditions && conditions.length) {
    		obj.conditions = conditions;
    	}

    	// The _sveltesparouter flag is to confirm the object was created by this router
    	Object.defineProperty(obj, "_sveltesparouter", { value: true });

    	return obj;
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    	});
    }

    function pop() {
    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.history.back();
    	});
    }

    function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    		try {
    			window.history.replaceState(undefined, undefined, dest);
    		} catch(e) {
    			// eslint-disable-next-line no-console
    			console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    		}

    		// The method above doesn't trigger the hashchange event, so let's do that manually
    		window.dispatchEvent(new Event("hashchange"));
    	});
    }

    function link(node) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	// Destination must start with '/'
    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to every href attribute
    	node.setAttribute("href", "#" + href);
    }

    function nextTickPromise(cb) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					resolve(cb());
    				},
    				0
    			);
    		});
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.route;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    			} else {
    				this.component = component;
    				this.conditions = [];
    				this.userData = undefined;
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix && path.startsWith(prefix)) {
    				path = path.substr(prefix.length) || "/";
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				out[this._keys[i]] = matches[++i] || null;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {SvelteComponent} component - Svelte component
     * @property {string} name - Name of the Svelte component
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	const dispatchNextTick = (name, detail) => {
    		// Execute this code when the current call stack is complete
    		setTimeout(
    			() => {
    				dispatch(name, detail);
    			},
    			0
    		);
    	};

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		nextTickPromise,
    		createEventDispatcher,
    		regexparam,
    		routes,
    		prefix,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		dispatch,
    		dispatchNextTick,
    		$loc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			// Handle hash change events
    			// Listen to changes in the $loc store and update the page
    			 {
    				// Find a route matching the location
    				$$invalidate(0, component = null);

    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						// Check if the route can be loaded - if all conditions succeed
    						if (!routesList[i].checkConditions(detail)) {
    							// Trigger an event to notify the user
    							dispatchNextTick("conditionsFailed", detail);

    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);

    						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    						if (match && typeof match == "object" && Object.keys(match).length) {
    							$$invalidate(1, componentParams = match);
    						} else {
    							$$invalidate(1, componentParams = null);
    						}

    						dispatchNextTick("routeLoaded", detail);
    					}

    					i++;
    				}
    			}
    		}
    	};

    	return [
    		component,
    		componentParams,
    		routes,
    		prefix,
    		$loc,
    		RouteItem,
    		routesList,
    		dispatch,
    		dispatchNextTick,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (Array.isArray(mix)) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules\sveltestrap\src\Table.svelte generated by Svelte v3.20.1 */
    const file = "node_modules\\sveltestrap\\src\\Table.svelte";

    // (38:0) {:else}
    function create_else_block$1(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file, 38, 2, 946);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if responsive}
    function create_if_block$1(ctx) {
    	let div;
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file, 33, 4, 859);
    			attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			add_location(div, file, 32, 2, 820);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));

    			if (!current || dirty & /*responsiveClassName*/ 4) {
    				attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(32:0) {#if responsive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*responsive*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { size = "" } = $$props;
    	let { bordered = false } = $$props;
    	let { borderless = false } = $$props;
    	let { striped = false } = $$props;
    	let { dark = false } = $$props;
    	let { hover = false } = $$props;
    	let { responsive = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$new_props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$new_props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$new_props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$new_props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$new_props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$new_props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		responsive,
    		props,
    		classes,
    		responsiveClassName
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("responsiveClassName" in $$props) $$invalidate(2, responsiveClassName = $$new_props.responsiveClassName);
    	};

    	let classes;
    	let responsiveClassName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, size, bordered, borderless, striped, dark, hover*/ 2032) {
    			 $$invalidate(1, classes = clsx(className, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, dark ? "table-dark" : false, hover ? "table-hover" : false));
    		}

    		if ($$self.$$.dirty & /*responsive*/ 1) {
    			 $$invalidate(2, responsiveClassName = responsive === true
    			? "table-responsive"
    			: `table-responsive-${responsive}`);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		responsive,
    		classes,
    		responsiveClassName,
    		props,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 4,
    			size: 5,
    			bordered: 6,
    			borderless: 7,
    			striped: 8,
    			dark: 9,
    			hover: 10,
    			responsive: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bordered() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bordered(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Button.svelte generated by Svelte v3.20.1 */
    const file$1 = "node_modules\\sveltestrap\\src\\Button.svelte";

    // (53:0) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let button_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file$1, 53, 2, 1114);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[21], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*close, children, $$scope*/ 262147) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*value*/ 64 && { value: /*value*/ ctx[6] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (37:0) {#if href}
    function create_if_block$2(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ href: /*href*/ ctx[3] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$1, 37, 2, 862);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[20], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*href*/ 8 && { href: /*href*/ ctx[3] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (68:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(68:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (66:25) 
    function create_if_block_3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (64:6) {#if close}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$1, 64, 8, 1314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (63:10)         
    function fallback_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[1]) return 0;
    		if (/*children*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(button, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(63:10)         ",
    		ctx
    	});

    	return block_1;
    }

    // (49:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (47:4) {#if children}
    function create_if_block_1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(47:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { disabled = false } = $$props;
    	let { href = "" } = $$props;
    	let { id = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$new_props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		active,
    		block,
    		children,
    		close,
    		color,
    		disabled,
    		href,
    		id,
    		outline,
    		size,
    		style,
    		value,
    		props,
    		ariaLabel,
    		classes,
    		defaultAriaLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(11, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(9, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(7, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, outline, color, size, block, active*/ 129026) {
    			 $$invalidate(8, classes = clsx(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active }));
    		}

    		if ($$self.$$.dirty & /*close*/ 2) {
    			 $$invalidate(9, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		close,
    		disabled,
    		href,
    		id,
    		style,
    		value,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		props,
    		className,
    		active,
    		block,
    		color,
    		outline,
    		size,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 11,
    			active: 12,
    			block: 13,
    			children: 0,
    			close: 1,
    			color: 14,
    			disabled: 2,
    			href: 3,
    			id: 4,
    			outline: 15,
    			size: 16,
    			style: 5,
    			value: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\ContactsTable.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\front\\ContactsTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount      }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (62:4) {:then contacts}
    function create_then_block(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, contacts, newContact*/ 4099) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(62:4) {:then contacts}",
    		ctx
    	});

    	return block;
    }

    // (77:25) <Button outline  color="primary" on:click={insertContact}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insert");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(77:25) <Button outline  color=\\\"primary\\\" on:click={insertContact}>",
    		ctx
    	});

    	return block;
    }

    // (85:28) <Button outline color="danger" on:click="{deleteContact(contact.name)}">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(85:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteContact(contact.name)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (80:16) {#each contacts as contact}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*contact*/ ctx[9].name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*contact*/ ctx[9].email + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*contact*/ ctx[9].phone + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deleteContact*/ ctx[3](/*contact*/ ctx[9].name))) /*deleteContact*/ ctx[3](/*contact*/ ctx[9].name).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			create_component(button.$$.fragment);
    			t6 = space();
    			attr_dev(a, "href", a_href_value = "#/contact/" + /*contact*/ ctx[9].name);
    			add_location(a, file$2, 81, 28, 2255);
    			add_location(td0, file$2, 81, 24, 2251);
    			add_location(td1, file$2, 82, 24, 2339);
    			add_location(td2, file$2, 83, 24, 2389);
    			add_location(td3, file$2, 84, 24, 2439);
    			add_location(tr, file$2, 80, 20, 2221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			mount_component(button, td3, null);
    			append_dev(tr, t6);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*contacts*/ 2) && t0_value !== (t0_value = /*contact*/ ctx[9].name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*contacts*/ 2 && a_href_value !== (a_href_value = "#/contact/" + /*contact*/ ctx[9].name)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*contacts*/ 2) && t2_value !== (t2_value = /*contact*/ ctx[9].email + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*contacts*/ 2) && t4_value !== (t4_value = /*contact*/ ctx[9].phone + "")) set_data_dev(t4, t4_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:16) {#each contacts as contact}",
    		ctx
    	});

    	return block;
    }

    // (63:8) <Table bordered>
    function create_default_slot(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t8;
    	let td1;
    	let input1;
    	let t9;
    	let td2;
    	let input2;
    	let t10;
    	let td3;
    	let t11;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertContact*/ ctx[2]);
    	let each_value = /*contacts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Email";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Phone";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Actions";
    			t7 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t8 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t9 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t10 = space();
    			td3 = element("td");
    			create_component(button.$$.fragment);
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$2, 65, 20, 1602);
    			add_location(th1, file$2, 66, 20, 1637);
    			add_location(th2, file$2, 67, 20, 1673);
    			add_location(th3, file$2, 68, 20, 1709);
    			add_location(tr0, file$2, 64, 16, 1576);
    			add_location(thead, file$2, 63, 12, 1551);
    			add_location(input0, file$2, 73, 24, 1839);
    			add_location(td0, file$2, 73, 20, 1835);
    			add_location(input1, file$2, 74, 24, 1908);
    			add_location(td1, file$2, 74, 20, 1904);
    			add_location(input2, file$2, 75, 24, 1978);
    			add_location(td2, file$2, 75, 20, 1974);
    			add_location(td3, file$2, 76, 20, 2044);
    			add_location(tr1, file$2, 72, 16, 1809);
    			add_location(tbody, file$2, 71, 12, 1784);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newContact*/ ctx[0].name);
    			append_dev(tr1, t8);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newContact*/ ctx[0].email);
    			append_dev(tr1, t9);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newContact*/ ctx[0].phone);
    			append_dev(tr1, t10);
    			append_dev(tr1, td3);
    			mount_component(button, td3, null);
    			append_dev(tbody, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[8])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newContact*/ 1 && input0.value !== /*newContact*/ ctx[0].name) {
    				set_input_value(input0, /*newContact*/ ctx[0].name);
    			}

    			if (dirty & /*newContact*/ 1 && input1.value !== /*newContact*/ ctx[0].email) {
    				set_input_value(input1, /*newContact*/ ctx[0].email);
    			}

    			if (dirty & /*newContact*/ 1 && input2.value !== /*newContact*/ ctx[0].phone) {
    				set_input_value(input2, /*newContact*/ ctx[0].phone);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*deleteContact, contacts*/ 10) {
    				each_value = /*contacts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(63:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (60:21)           Loading contacts...      {:then contacts}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading contacts...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(60:21)           Loading contacts...      {:then contacts}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 1,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*contacts*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			add_location(main, file$2, 57, 0, 1428);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*contacts*/ 2 && promise !== (promise = /*contacts*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let contacts = [];
    	let newContact = { name: "", phone: "", email: "" };
    	let errorMSG = "";
    	onMount(getContacts);

    	async function getContacts() {
    		console.log("Fetching contacts...");
    		const res = await fetch("/api/v1/contacts");

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(1, contacts = json);
    			console.log("Received " + contacts.length + " contacts.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	async function insertContact() {
    		console.log("Inserting contact..." + JSON.stringify(newContact));

    		const res = await fetch("/api/v1/contacts", {
    			method: "POST",
    			body: JSON.stringify(newContact),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getContacts();
    		});
    	}

    	async function deleteContact(name) {
    		const res = await fetch("/api/v1/contacts/" + name, { method: "DELETE" }).then(function (res) {
    			getContacts();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ContactsTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ContactsTable", $$slots, []);

    	function input0_input_handler() {
    		newContact.name = this.value;
    		$$invalidate(0, newContact);
    	}

    	function input1_input_handler() {
    		newContact.email = this.value;
    		$$invalidate(0, newContact);
    	}

    	function input2_input_handler() {
    		newContact.phone = this.value;
    		$$invalidate(0, newContact);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Table,
    		Button,
    		contacts,
    		newContact,
    		errorMSG,
    		getContacts,
    		insertContact,
    		deleteContact
    	});

    	$$self.$inject_state = $$props => {
    		if ("contacts" in $$props) $$invalidate(1, contacts = $$props.contacts);
    		if ("newContact" in $$props) $$invalidate(0, newContact = $$props.newContact);
    		if ("errorMSG" in $$props) errorMSG = $$props.errorMSG;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newContact,
    		contacts,
    		insertContact,
    		deleteContact,
    		errorMSG,
    		getContacts,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class ContactsTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactsTable",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\front\EditContact.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\front\\EditContact.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (62:4) {:then contact}
    function create_then_block$1(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedPhone, updatedEmail, updatedName*/ 1038) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(62:4) {:then contact}",
    		ctx
    	});

    	return block;
    }

    // (77:25) <Button outline  color="primary" on:click={updateContact}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(77:25) <Button outline  color=\\\"primary\\\" on:click={updateContact}>",
    		ctx
    	});

    	return block;
    }

    // (63:8) <Table bordered>
    function create_default_slot_1$1(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let tr1;
    	let td0;
    	let t8;
    	let t9;
    	let td1;
    	let input0;
    	let t10;
    	let td2;
    	let input1;
    	let t11;
    	let td3;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateContact*/ ctx[6]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Email";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Phone";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Actions";
    			t7 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t8 = text(/*updatedName*/ ctx[1]);
    			t9 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t10 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t11 = space();
    			td3 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$3, 65, 20, 1871);
    			add_location(th1, file$3, 66, 20, 1906);
    			add_location(th2, file$3, 67, 20, 1942);
    			add_location(th3, file$3, 68, 20, 1978);
    			add_location(tr0, file$3, 64, 16, 1845);
    			add_location(thead, file$3, 63, 12, 1820);
    			add_location(td0, file$3, 73, 20, 2104);
    			add_location(input0, file$3, 74, 24, 2152);
    			add_location(td1, file$3, 74, 20, 2148);
    			add_location(input1, file$3, 75, 24, 2218);
    			add_location(td2, file$3, 75, 20, 2214);
    			add_location(td3, file$3, 76, 20, 2280);
    			add_location(tr1, file$3, 72, 16, 2078);
    			add_location(tbody, file$3, 71, 12, 2053);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t8);
    			append_dev(tr1, t9);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*updatedEmail*/ ctx[3]);
    			append_dev(tr1, t10);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*updatedPhone*/ ctx[2]);
    			append_dev(tr1, t11);
    			append_dev(tr1, td3);
    			mount_component(button, td3, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[9])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updatedName*/ 2) set_data_dev(t8, /*updatedName*/ ctx[1]);

    			if (dirty & /*updatedEmail*/ 8 && input0.value !== /*updatedEmail*/ ctx[3]) {
    				set_input_value(input0, /*updatedEmail*/ ctx[3]);
    			}

    			if (dirty & /*updatedPhone*/ 4 && input1.value !== /*updatedPhone*/ ctx[2]) {
    				set_input_value(input1, /*updatedPhone*/ ctx[2]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(63:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (60:20)           Loading contact...      {:then contact}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading contact...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(60:20)           Loading contact...      {:then contact}",
    		ctx
    	});

    	return block;
    }

    // (82:4) {#if errorMSG}
    function create_if_block$3(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("ERROR: ");
    			t1 = text(/*errorMSG*/ ctx[4]);
    			set_style(p, "color", "red");
    			add_location(p, file$3, 82, 8, 2472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 16) set_data_dev(t1, /*errorMSG*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(82:4) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (85:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(85:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let h3;
    	let t0;
    	let strong;
    	let t1_value = /*params*/ ctx[0].contactName + "";
    	let t1;
    	let t2;
    	let promise;
    	let t3;
    	let t4;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*contact*/ ctx[5], info);
    	let if_block = /*errorMSG*/ ctx[4] && create_if_block$3(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			t0 = text("Edit Contact ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			info.block.c();
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$3, 58, 21, 1667);
    			add_location(h3, file$3, 58, 4, 1650);
    			add_location(main, file$3, 57, 0, 1638);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    			append_dev(h3, t0);
    			append_dev(h3, strong);
    			append_dev(strong, t1);
    			append_dev(main, t2);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t3;
    			append_dev(main, t3);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t4);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t1_value !== (t1_value = /*params*/ ctx[0].contactName + "")) set_data_dev(t1, t1_value);
    			info.ctx = ctx;

    			if (dirty & /*contact*/ 32 && promise !== (promise = /*contact*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*errorMSG*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(main, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let contact = {};
    	let updatedName = "XXXX";
    	let updatedPhone = "7975";
    	let updatedEmail = "XXXX@fdsf.com";
    	let errorMSG = "";
    	onMount(getContact);

    	async function getContact() {
    		console.log("Fetching contact...");
    		const res = await fetch("/api/v1/contacts/" + params.contactName);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(5, contact = json);
    			$$invalidate(1, updatedName = contact.name);
    			$$invalidate(2, updatedPhone = contact.phone);
    			$$invalidate(3, updatedEmail = contact.email);
    			console.log("Received contact.");
    		} else {
    			$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	async function updateContact() {
    		console.log("Inserting contact..." + JSON.stringify(params.contactName));

    		const res = await fetch("/api/v1/contacts/" + params.contactName, {
    			method: "PUT",
    			body: JSON.stringify({
    				name: params.contactName,
    				phone: updatedPhone,
    				email: updatedEmail
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getContact();
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<EditContact> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditContact", $$slots, []);

    	function input0_input_handler() {
    		updatedEmail = this.value;
    		$$invalidate(3, updatedEmail);
    	}

    	function input1_input_handler() {
    		updatedPhone = this.value;
    		$$invalidate(2, updatedPhone);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		params,
    		contact,
    		updatedName,
    		updatedPhone,
    		updatedEmail,
    		errorMSG,
    		getContact,
    		updateContact
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("contact" in $$props) $$invalidate(5, contact = $$props.contact);
    		if ("updatedName" in $$props) $$invalidate(1, updatedName = $$props.updatedName);
    		if ("updatedPhone" in $$props) $$invalidate(2, updatedPhone = $$props.updatedPhone);
    		if ("updatedEmail" in $$props) $$invalidate(3, updatedEmail = $$props.updatedEmail);
    		if ("errorMSG" in $$props) $$invalidate(4, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updatedName,
    		updatedPhone,
    		updatedEmail,
    		errorMSG,
    		contact,
    		updateContact,
    		getContact,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class EditContact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditContact",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get params() {
    		throw new Error("<EditContact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditContact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\NotFound.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\front\\NotFound.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "La página no existe!";
    			add_location(h1, file$4, 1, 4, 12);
    			add_location(main, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", $$slots, []);
    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\front\Home.svelte generated by Svelte v3.20.1 */
    const file$5 = "src\\front\\Home.svelte";

    // (15:0) <Button outline color="secondary">
    function create_default_slot_3(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI spc";
    			attr_dev(a, "href", "#/gui1SPC");
    			add_location(a, file$5, 14, 34, 303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(15:0) <Button outline color=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Button outline color="secondary">
    function create_default_slot_2$2(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI poverty";
    			attr_dev(a, "href", "#/gui2poverty");
    			add_location(a, file$5, 15, 34, 380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(16:0) <Button outline color=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Button outline color="secondary">
    function create_default_slot_1$2(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI lq";
    			attr_dev(a, "href", "#/gui3lq");
    			add_location(a, file$5, 16, 34, 465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(17:0) <Button outline color=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:0) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(21:0) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let current;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button2 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			create_component(button0.$$.fragment);
    			t1 = space();
    			create_component(button1.$$.fragment);
    			t2 = space();
    			create_component(button2.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			create_component(button3.$$.fragment);
    			add_location(br0, file$5, 13, 1, 263);
    			add_location(br1, file$5, 18, 0, 508);
    			add_location(br2, file$5, 19, 0, 514);
    			add_location(main, file$5, 12, 1, 254);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			mount_component(button0, main, null);
    			append_dev(main, t1);
    			mount_component(button1, main, null);
    			append_dev(main, t2);
    			mount_component(button2, main, null);
    			append_dev(main, t3);
    			append_dev(main, br1);
    			append_dev(main, t4);
    			append_dev(main, br2);
    			append_dev(main, t5);
    			mount_component(button3, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, pop, Table, Button });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\sveltestrap\src\Alert.svelte generated by Svelte v3.20.1 */
    const file$6 = "node_modules\\sveltestrap\\src\\Alert.svelte";

    // (25:0) {#if isOpen}
    function create_if_block$4(ctx) {
    	let div;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let div_transition;
    	let current;
    	let if_block0 = /*toggle*/ ctx[3] && create_if_block_2$1(ctx);
    	const if_block_creators = [create_if_block_1$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let div_levels = [/*props*/ ctx[7], { class: /*classes*/ ctx[5] }, { role: "alert" }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 25, 2, 709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*toggle*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div, null);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 128 && /*props*/ ctx[7],
    				dirty & /*classes*/ 32 && { class: /*classes*/ ctx[5] },
    				{ role: "alert" }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, /*transition*/ ctx[4], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, /*transition*/ ctx[4], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(25:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if toggle}
    function create_if_block_2$1(ctx) {
    	let button;
    	let span;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$6, 36, 8, 977);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", /*closeClassNames*/ ctx[6]);
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$6, 31, 6, 839);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			if (remount) dispose();

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*toggle*/ ctx[3])) /*toggle*/ ctx[3].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*closeClassNames*/ 64) {
    				attr_dev(button, "class", /*closeClassNames*/ ctx[6]);
    			}

    			if (dirty & /*closeAriaLabel*/ 2) {
    				attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(31:4) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[13], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(42:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#if children}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(40:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { children = undefined } = $$props;
    	let { color = "success" } = $$props;
    	let { closeClassName = "" } = $$props;
    	let { closeAriaLabel = "Close" } = $$props;
    	let { isOpen = true } = $$props;
    	let { toggle = undefined } = $$props;
    	let { fade: fade$1 = true } = $$props;
    	let { transition = { duration: fade$1 ? 400 : 0 } } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Alert", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(8, className = $$new_props.class);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("color" in $$new_props) $$invalidate(9, color = $$new_props.color);
    		if ("closeClassName" in $$new_props) $$invalidate(10, closeClassName = $$new_props.closeClassName);
    		if ("closeAriaLabel" in $$new_props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("isOpen" in $$new_props) $$invalidate(2, isOpen = $$new_props.isOpen);
    		if ("toggle" in $$new_props) $$invalidate(3, toggle = $$new_props.toggle);
    		if ("fade" in $$new_props) $$invalidate(11, fade$1 = $$new_props.fade);
    		if ("transition" in $$new_props) $$invalidate(4, transition = $$new_props.transition);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fadeTransition: fade,
    		clsx,
    		clean,
    		className,
    		children,
    		color,
    		closeClassName,
    		closeAriaLabel,
    		isOpen,
    		toggle,
    		fade: fade$1,
    		transition,
    		props,
    		classes,
    		closeClassNames
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(8, className = $$new_props.className);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("color" in $$props) $$invalidate(9, color = $$new_props.color);
    		if ("closeClassName" in $$props) $$invalidate(10, closeClassName = $$new_props.closeClassName);
    		if ("closeAriaLabel" in $$props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("isOpen" in $$props) $$invalidate(2, isOpen = $$new_props.isOpen);
    		if ("toggle" in $$props) $$invalidate(3, toggle = $$new_props.toggle);
    		if ("fade" in $$props) $$invalidate(11, fade$1 = $$new_props.fade);
    		if ("transition" in $$props) $$invalidate(4, transition = $$new_props.transition);
    		if ("classes" in $$props) $$invalidate(5, classes = $$new_props.classes);
    		if ("closeClassNames" in $$props) $$invalidate(6, closeClassNames = $$new_props.closeClassNames);
    	};

    	let classes;
    	let closeClassNames;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, color, toggle*/ 776) {
    			 $$invalidate(5, classes = clsx(className, "alert", `alert-${color}`, { "alert-dismissible": toggle }));
    		}

    		if ($$self.$$.dirty & /*closeClassName*/ 1024) {
    			 $$invalidate(6, closeClassNames = clsx("close", closeClassName));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		closeAriaLabel,
    		isOpen,
    		toggle,
    		transition,
    		classes,
    		closeClassNames,
    		props,
    		className,
    		color,
    		closeClassName,
    		fade$1,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Alert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 8,
    			children: 0,
    			color: 9,
    			closeClassName: 10,
    			closeAriaLabel: 1,
    			isOpen: 2,
    			toggle: 3,
    			fade: 11,
    			transition: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Alert",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeClassName() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeClassName(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeAriaLabel() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAriaLabel(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI1SPC\Home.svelte generated by Svelte v3.20.1 */

    const { console: console_1$3 } = globals;
    const file$7 = "src\\front\\GUI1SPC\\Home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (201:4) {:then spc}
    function create_then_block$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[1],
    				isOpen: /*visible*/ ctx[0],
    				toggle: /*func*/ ctx[14],
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getSPCLoadInitialData*/ ctx[5]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteSPCALL*/ ctx[8]);

    	const button2 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*getPreviewPage*/ ctx[10]);

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*getNextPage*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t0 = space();
    			create_component(table.$$.fragment);
    			t1 = space();
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			t3 = space();
    			create_component(button2.$$.fragment);
    			t4 = space();
    			create_component(button3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(table, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(button2, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(button3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};
    			if (dirty & /*color*/ 2) alert_changes.color = /*color*/ ctx[1];
    			if (dirty & /*visible*/ 1) alert_changes.isOpen = /*visible*/ ctx[0];
    			if (dirty & /*visible*/ 1) alert_changes.toggle = /*func*/ ctx[14];

    			if (dirty & /*$$scope, errorMSG*/ 134217736) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, spc, newSpc*/ 134217748) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(button2, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(button3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(201:4) {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (203:8) {#if errorMSG}
    function create_if_block$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*errorMSG*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 8) set_data_dev(t, /*errorMSG*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(203:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (202:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_8(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[3] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*errorMSG*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(202:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (233:25) <Button outline  color="primary" on:click={insertSPC}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insert");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(233:25) <Button outline  color=\\\"primary\\\" on:click={insertSPC}>",
    		ctx
    	});

    	return block;
    }

    // (247:28) <Button outline color="danger" on:click="{deleteSPC(suicide.country, suicide.year)}">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(247:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteSPC(suicide.country, suicide.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (236:16) {#each spc as suicide}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*suicide*/ ctx[24].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*suicide*/ ctx[24].both_sex + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*suicide*/ ctx[24].male_rank + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*suicide*/ ctx[24].male_number + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*suicide*/ ctx[24].female_rank + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*suicide*/ ctx[24].female_number + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*suicide*/ ctx[24].ratio + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*suicide*/ ctx[24].year + "";
    	let t14;
    	let t15;
    	let td8;
    	let t16_value = /*suicide*/ ctx[24].continent + "";
    	let t16;
    	let t17;
    	let td9;
    	let t18;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deleteSPC*/ ctx[7](/*suicide*/ ctx[24].country, /*suicide*/ ctx[24].year))) /*deleteSPC*/ ctx[7](/*suicide*/ ctx[24].country, /*suicide*/ ctx[24].year).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			create_component(button.$$.fragment);
    			t18 = space();
    			attr_dev(a, "href", a_href_value = "#/spc-stats/" + /*suicide*/ ctx[24].country + "/" + /*suicide*/ ctx[24].year);
    			add_location(a, file$7, 237, 28, 7835);
    			add_location(td0, file$7, 237, 24, 7831);
    			add_location(td1, file$7, 238, 24, 7942);
    			add_location(td2, file$7, 239, 24, 7995);
    			add_location(td3, file$7, 240, 24, 8049);
    			add_location(td4, file$7, 241, 24, 8105);
    			add_location(td5, file$7, 242, 24, 8161);
    			add_location(td6, file$7, 243, 24, 8219);
    			add_location(td7, file$7, 244, 24, 8269);
    			add_location(td8, file$7, 245, 24, 8318);
    			add_location(td9, file$7, 246, 24, 8372);
    			add_location(tr, file$7, 236, 20, 7801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			append_dev(td7, t14);
    			append_dev(tr, t15);
    			append_dev(tr, td8);
    			append_dev(td8, t16);
    			append_dev(tr, t17);
    			append_dev(tr, td9);
    			mount_component(button, td9, null);
    			append_dev(tr, t18);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*spc*/ 16) && t0_value !== (t0_value = /*suicide*/ ctx[24].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*spc*/ 16 && a_href_value !== (a_href_value = "#/spc-stats/" + /*suicide*/ ctx[24].country + "/" + /*suicide*/ ctx[24].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*spc*/ 16) && t2_value !== (t2_value = /*suicide*/ ctx[24].both_sex + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*spc*/ 16) && t4_value !== (t4_value = /*suicide*/ ctx[24].male_rank + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*spc*/ 16) && t6_value !== (t6_value = /*suicide*/ ctx[24].male_number + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*spc*/ 16) && t8_value !== (t8_value = /*suicide*/ ctx[24].female_rank + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*spc*/ 16) && t10_value !== (t10_value = /*suicide*/ ctx[24].female_number + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*spc*/ 16) && t12_value !== (t12_value = /*suicide*/ ctx[24].ratio + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*spc*/ 16) && t14_value !== (t14_value = /*suicide*/ ctx[24].year + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*spc*/ 16) && t16_value !== (t16_value = /*suicide*/ ctx[24].continent + "")) set_data_dev(t16, t16_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(236:16) {#each spc as suicide}",
    		ctx
    	});

    	return block;
    }

    // (207:8) <Table bordered>
    function create_default_slot_5(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let th8;
    	let t17;
    	let th9;
    	let t19;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t20;
    	let td1;
    	let input1;
    	let t21;
    	let td2;
    	let input2;
    	let t22;
    	let td3;
    	let input3;
    	let t23;
    	let td4;
    	let input4;
    	let t24;
    	let td5;
    	let input5;
    	let t25;
    	let td6;
    	let input6;
    	let t26;
    	let td7;
    	let input7;
    	let t27;
    	let td8;
    	let input8;
    	let t28;
    	let td9;
    	let t29;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertSPC*/ ctx[6]);
    	let each_value = /*spc*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Country";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Both_sex";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Male_rank";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Male_number";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Female_rank";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Female_number";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Ratio";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Year";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "Continent";
    			t17 = space();
    			th9 = element("th");
    			th9.textContent = "Actions";
    			t19 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t20 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t21 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t22 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t23 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t24 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t25 = space();
    			td6 = element("td");
    			input6 = element("input");
    			t26 = space();
    			td7 = element("td");
    			input7 = element("input");
    			t27 = space();
    			td8 = element("td");
    			input8 = element("input");
    			t28 = space();
    			td9 = element("td");
    			create_component(button.$$.fragment);
    			t29 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$7, 209, 20, 6525);
    			add_location(th1, file$7, 210, 20, 6563);
    			add_location(th2, file$7, 211, 20, 6602);
    			add_location(th3, file$7, 212, 20, 6642);
    			add_location(th4, file$7, 213, 20, 6684);
    			add_location(th5, file$7, 214, 20, 6726);
    			add_location(th6, file$7, 215, 20, 6770);
    			add_location(th7, file$7, 216, 20, 6806);
    			add_location(th8, file$7, 217, 20, 6841);
    			add_location(th9, file$7, 218, 20, 6881);
    			add_location(tr0, file$7, 208, 16, 6499);
    			add_location(thead, file$7, 207, 12, 6474);
    			add_location(input0, file$7, 223, 24, 7011);
    			add_location(td0, file$7, 223, 20, 7007);
    			add_location(input1, file$7, 224, 24, 7079);
    			add_location(td1, file$7, 224, 20, 7075);
    			add_location(input2, file$7, 225, 24, 7148);
    			add_location(td2, file$7, 225, 20, 7144);
    			add_location(input3, file$7, 226, 24, 7218);
    			add_location(td3, file$7, 226, 20, 7214);
    			add_location(input4, file$7, 227, 24, 7290);
    			add_location(td4, file$7, 227, 20, 7286);
    			add_location(input5, file$7, 228, 24, 7362);
    			add_location(td5, file$7, 228, 20, 7358);
    			add_location(input6, file$7, 229, 24, 7436);
    			add_location(td6, file$7, 229, 20, 7432);
    			add_location(input7, file$7, 230, 24, 7502);
    			add_location(td7, file$7, 230, 20, 7498);
    			add_location(input8, file$7, 231, 24, 7567);
    			add_location(td8, file$7, 231, 20, 7563);
    			add_location(td9, file$7, 232, 20, 7633);
    			add_location(tr1, file$7, 222, 16, 6981);
    			add_location(tbody, file$7, 221, 12, 6956);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			append_dev(tr0, t15);
    			append_dev(tr0, th8);
    			append_dev(tr0, t17);
    			append_dev(tr0, th9);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newSpc*/ ctx[2].country);
    			append_dev(tr1, t20);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newSpc*/ ctx[2].both_sex);
    			append_dev(tr1, t21);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newSpc*/ ctx[2].male_rank);
    			append_dev(tr1, t22);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newSpc*/ ctx[2].male_number);
    			append_dev(tr1, t23);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newSpc*/ ctx[2].female_rank);
    			append_dev(tr1, t24);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newSpc*/ ctx[2].female_number);
    			append_dev(tr1, t25);
    			append_dev(tr1, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*newSpc*/ ctx[2].ratio);
    			append_dev(tr1, t26);
    			append_dev(tr1, td7);
    			append_dev(td7, input7);
    			set_input_value(input7, /*newSpc*/ ctx[2].year);
    			append_dev(tr1, t27);
    			append_dev(tr1, td8);
    			append_dev(td8, input8);
    			set_input_value(input8, /*newSpc*/ ctx[2].continent);
    			append_dev(tr1, t28);
    			append_dev(tr1, td9);
    			mount_component(button, td9, null);
    			append_dev(tbody, t29);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[17]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[18]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[19]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[20]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[21]),
    				listen_dev(input7, "input", /*input7_input_handler*/ ctx[22]),
    				listen_dev(input8, "input", /*input8_input_handler*/ ctx[23])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newSpc*/ 4 && input0.value !== /*newSpc*/ ctx[2].country) {
    				set_input_value(input0, /*newSpc*/ ctx[2].country);
    			}

    			if (dirty & /*newSpc*/ 4 && input1.value !== /*newSpc*/ ctx[2].both_sex) {
    				set_input_value(input1, /*newSpc*/ ctx[2].both_sex);
    			}

    			if (dirty & /*newSpc*/ 4 && input2.value !== /*newSpc*/ ctx[2].male_rank) {
    				set_input_value(input2, /*newSpc*/ ctx[2].male_rank);
    			}

    			if (dirty & /*newSpc*/ 4 && input3.value !== /*newSpc*/ ctx[2].male_number) {
    				set_input_value(input3, /*newSpc*/ ctx[2].male_number);
    			}

    			if (dirty & /*newSpc*/ 4 && input4.value !== /*newSpc*/ ctx[2].female_rank) {
    				set_input_value(input4, /*newSpc*/ ctx[2].female_rank);
    			}

    			if (dirty & /*newSpc*/ 4 && input5.value !== /*newSpc*/ ctx[2].female_number) {
    				set_input_value(input5, /*newSpc*/ ctx[2].female_number);
    			}

    			if (dirty & /*newSpc*/ 4 && input6.value !== /*newSpc*/ ctx[2].ratio) {
    				set_input_value(input6, /*newSpc*/ ctx[2].ratio);
    			}

    			if (dirty & /*newSpc*/ 4 && input7.value !== /*newSpc*/ ctx[2].year) {
    				set_input_value(input7, /*newSpc*/ ctx[2].year);
    			}

    			if (dirty & /*newSpc*/ 4 && input8.value !== /*newSpc*/ ctx[2].continent) {
    				set_input_value(input8, /*newSpc*/ ctx[2].continent);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*deleteSPC, spc*/ 144) {
    				each_value = /*spc*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(207:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (252:8) <Button color="primary" on:click="{getSPCLoadInitialData}">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reiniciar ejemplos iniciales");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(252:8) <Button color=\\\"primary\\\" on:click=\\\"{getSPCLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (255:8) <Button color="danger" on:click="{deleteSPCALL}">
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(255:8) <Button color=\\\"danger\\\" on:click=\\\"{deleteSPCALL}\\\">",
    		ctx
    	});

    	return block;
    }

    // (258:8) <Button outline color="success" on:click="{getPreviewPage}">
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Atras");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(258:8) <Button outline color=\\\"success\\\" on:click=\\\"{getPreviewPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (261:8) <Button outline color="success" on:click="{getNextPage}">
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Siguiente");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(261:8) <Button outline color=\\\"success\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (199:16)           Loading spc...      {:then spc}
    function create_pending_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading spc...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(199:16)           Loading spc...      {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (269:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(269:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let promise;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 4,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*spc*/ ctx[4], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "SPC Manager";
    			t1 = space();
    			info.block.c();
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			create_component(button.$$.fragment);
    			add_location(h1, file$7, 197, 4, 6201);
    			add_location(br0, file$7, 266, 4, 9057);
    			add_location(br1, file$7, 267, 4, 9067);
    			add_location(main, file$7, 196, 0, 6189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t2;
    			append_dev(main, t2);
    			append_dev(main, br0);
    			append_dev(main, t3);
    			append_dev(main, br1);
    			append_dev(main, t4);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*spc*/ 16 && promise !== (promise = /*spc*/ ctx[4]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[4] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let page = 1;
    	let totaldata = 12;
    	let spc = [];

    	let newSpc = {
    		country: "",
    		both_sex: "",
    		male_rank: "",
    		male_number: "",
    		female_rank: "",
    		female_number: "",
    		ratio: "",
    		year: "",
    		continent: ""
    	};

    	let errorMSG = "";
    	onMount(getSPC);

    	//GET
    	async function getSPC() {
    		console.log("Fetching spc...");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(4, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//GET INITIALDATA
    	async function getSPCLoadInitialData() {
    		console.log("Fetching spc...");
    		await fetch("/api/v2/spc-stats/loadInitialData");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(4, spc = json);
    			totaldata = 12;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//INSERT
    	async function insertSPC() {
    		console.log("Inserting spc..." + JSON.stringify(newSpc));

    		const res = await fetch("/api/v2/spc-stats", {
    			method: "POST",
    			body: JSON.stringify(newSpc),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getSPC();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				totaldata++;
    				$$invalidate(1, color = "success");
    				$$invalidate(3, errorMSG = newSpc.country + " creado correctamente");
    				console.log("Inserted " + newSpc.country + " spc.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			} else if (res.status == 409) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = newSpc.country + " " + newSpc.year + "  ya existe, recuerde que Year y Country son exclusivos.");
    				console.log("This data already exits");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	//DELETE SPECIFIC
    	async function deleteSPC(name, year) {
    		const res = await fetch("/api/v2/spc-stats/" + name + "/" + year, { method: "DELETE" }).then(function (res) {
    			$$invalidate(0, visible = true);
    			getSPC();

    			if (res.status == 200) {
    				totaldata--;
    				$$invalidate(1, color = "success");
    				$$invalidate(3, errorMSG = name + " " + year + " borrado correctamente");
    				console.log("Deleted " + name);
    			} else if (res.status == 404) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = "No se ha encontrado el objeto" + name);
    				console.log("SUICIDE NOT FOUND");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deleteSPCALL() {
    		const res = await fetch("/api/v2/spc-stats/", { method: "DELETE" }).then(function (res) {
    			getSPC();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				totaldata = 0;
    				$$invalidate(1, color = "success");
    				$$invalidate(3, errorMSG = "Objetos borrados correctamente");
    				console.log("Deleted all spc.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//getNextPage
    	async function getNextPage() {
    		console.log(totaldata);

    		if (page + 10 > totaldata) {
    			page = 1;
    		} else {
    			page += 10;
    		}

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(4, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//getPreviewPage
    	async function getPreviewPage() {
    		if (page - 10 >= 1) {
    			page -= 10;
    		} else page = 1;

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(4, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const func = () => $$invalidate(0, visible = false);

    	function input0_input_handler() {
    		newSpc.country = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input1_input_handler() {
    		newSpc.both_sex = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input2_input_handler() {
    		newSpc.male_rank = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input3_input_handler() {
    		newSpc.male_number = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input4_input_handler() {
    		newSpc.female_rank = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input5_input_handler() {
    		newSpc.female_number = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input6_input_handler() {
    		newSpc.ratio = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input7_input_handler() {
    		newSpc.year = this.value;
    		$$invalidate(2, newSpc);
    	}

    	function input8_input_handler() {
    		newSpc.continent = this.value;
    		$$invalidate(2, newSpc);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		page,
    		totaldata,
    		spc,
    		newSpc,
    		errorMSG,
    		getSPC,
    		getSPCLoadInitialData,
    		insertSPC,
    		deleteSPC,
    		deleteSPCALL,
    		getNextPage,
    		getPreviewPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("page" in $$props) page = $$props.page;
    		if ("totaldata" in $$props) totaldata = $$props.totaldata;
    		if ("spc" in $$props) $$invalidate(4, spc = $$props.spc);
    		if ("newSpc" in $$props) $$invalidate(2, newSpc = $$props.newSpc);
    		if ("errorMSG" in $$props) $$invalidate(3, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		color,
    		newSpc,
    		errorMSG,
    		spc,
    		getSPCLoadInitialData,
    		insertSPC,
    		deleteSPC,
    		deleteSPCALL,
    		getNextPage,
    		getPreviewPage,
    		page,
    		totaldata,
    		getSPC,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler
    	];
    }

    class Home$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\front\GUI1SPC\EditSpc.svelte generated by Svelte v3.20.1 */

    const { console: console_1$4 } = globals;
    const file$8 = "src\\front\\GUI1SPC\\EditSpc.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (109:4) {:then spc}
    function create_then_block$3(ctx) {
    	let t;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[2],
    				isOpen: /*visible*/ ctx[1],
    				toggle: /*func*/ ctx[16],
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t = space();
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};
    			if (dirty & /*color*/ 4) alert_changes.color = /*color*/ ctx[2];
    			if (dirty & /*visible*/ 2) alert_changes.isOpen = /*visible*/ ctx[1];
    			if (dirty & /*visible*/ 2) alert_changes.toggle = /*func*/ ctx[16];

    			if (dirty & /*$$scope, errorMSG*/ 16781312) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedContinent, updatedYear, updatedRatio, updatedFemaleNumber, updatedFemaleRank, updatedMaleNumber, updatedMaleRank, updatedBothSex, updatedCountry*/ 16781304) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(109:4) {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#if errorMSG}
    function create_if_block$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*errorMSG*/ ctx[12]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 4096) set_data_dev(t, /*errorMSG*/ ctx[12]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(111:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (110:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_3$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[12] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*errorMSG*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(110:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (141:25) <Button outline  color="primary" on:click={updateSpc}>
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(141:25) <Button outline  color=\\\"primary\\\" on:click={updateSpc}>",
    		ctx
    	});

    	return block;
    }

    // (115:8) <Table bordered>
    function create_default_slot_1$4(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let th8;
    	let t17;
    	let th9;
    	let t19;
    	let tbody;
    	let tr1;
    	let td0;
    	let t20;
    	let t21;
    	let td1;
    	let input0;
    	let t22;
    	let td2;
    	let input1;
    	let t23;
    	let td3;
    	let input2;
    	let t24;
    	let td4;
    	let input3;
    	let t25;
    	let td5;
    	let input4;
    	let t26;
    	let td6;
    	let input5;
    	let t27;
    	let td7;
    	let t28;
    	let t29;
    	let td8;
    	let input6;
    	let t30;
    	let td9;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateSpc*/ ctx[14]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Country";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Both_sex";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Male_rank";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Male_number";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Female_rank";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Female_number";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Ratio";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Year";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "Continent";
    			t17 = space();
    			th9 = element("th");
    			th9.textContent = "Actions";
    			t19 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t20 = text(/*updatedCountry*/ ctx[3]);
    			t21 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t22 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t23 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t24 = space();
    			td4 = element("td");
    			input3 = element("input");
    			t25 = space();
    			td5 = element("td");
    			input4 = element("input");
    			t26 = space();
    			td6 = element("td");
    			input5 = element("input");
    			t27 = space();
    			td7 = element("td");
    			t28 = text(/*updatedYear*/ ctx[4]);
    			t29 = space();
    			td8 = element("td");
    			input6 = element("input");
    			t30 = space();
    			td9 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$8, 117, 20, 3769);
    			add_location(th1, file$8, 118, 20, 3807);
    			add_location(th2, file$8, 119, 20, 3846);
    			add_location(th3, file$8, 120, 20, 3886);
    			add_location(th4, file$8, 121, 20, 3928);
    			add_location(th5, file$8, 122, 20, 3970);
    			add_location(th6, file$8, 123, 20, 4014);
    			add_location(th7, file$8, 124, 20, 4050);
    			add_location(th8, file$8, 125, 20, 4085);
    			add_location(th9, file$8, 126, 20, 4125);
    			add_location(tr0, file$8, 116, 16, 3743);
    			add_location(thead, file$8, 115, 12, 3718);
    			add_location(td0, file$8, 131, 20, 4251);
    			add_location(input0, file$8, 132, 24, 4302);
    			add_location(td1, file$8, 132, 20, 4298);
    			add_location(input1, file$8, 133, 24, 4370);
    			add_location(td2, file$8, 133, 20, 4366);
    			add_location(input2, file$8, 134, 24, 4439);
    			add_location(td3, file$8, 134, 20, 4435);
    			add_location(input3, file$8, 135, 24, 4510);
    			add_location(td4, file$8, 135, 20, 4506);
    			add_location(input4, file$8, 136, 24, 4581);
    			add_location(td5, file$8, 136, 20, 4577);
    			add_location(input5, file$8, 137, 24, 4654);
    			add_location(td6, file$8, 137, 20, 4650);
    			add_location(td7, file$8, 138, 20, 4716);
    			add_location(input6, file$8, 139, 24, 4764);
    			add_location(td8, file$8, 139, 20, 4760);
    			add_location(td9, file$8, 140, 20, 4830);
    			add_location(tr1, file$8, 130, 16, 4225);
    			add_location(tbody, file$8, 129, 12, 4200);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			append_dev(tr0, t15);
    			append_dev(tr0, th8);
    			append_dev(tr0, t17);
    			append_dev(tr0, th9);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*updatedBothSex*/ ctx[8]);
    			append_dev(tr1, t22);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*updatedMaleRank*/ ctx[7]);
    			append_dev(tr1, t23);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*updatedMaleNumber*/ ctx[10]);
    			append_dev(tr1, t24);
    			append_dev(tr1, td4);
    			append_dev(td4, input3);
    			set_input_value(input3, /*updatedFemaleRank*/ ctx[6]);
    			append_dev(tr1, t25);
    			append_dev(tr1, td5);
    			append_dev(td5, input4);
    			set_input_value(input4, /*updatedFemaleNumber*/ ctx[9]);
    			append_dev(tr1, t26);
    			append_dev(tr1, td6);
    			append_dev(td6, input5);
    			set_input_value(input5, /*updatedRatio*/ ctx[11]);
    			append_dev(tr1, t27);
    			append_dev(tr1, td7);
    			append_dev(td7, t28);
    			append_dev(tr1, t29);
    			append_dev(tr1, td8);
    			append_dev(td8, input6);
    			set_input_value(input6, /*updatedContinent*/ ctx[5]);
    			append_dev(tr1, t30);
    			append_dev(tr1, td9);
    			mount_component(button, td9, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[20]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[21]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[22]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[23])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updatedCountry*/ 8) set_data_dev(t20, /*updatedCountry*/ ctx[3]);

    			if (dirty & /*updatedBothSex*/ 256 && input0.value !== /*updatedBothSex*/ ctx[8]) {
    				set_input_value(input0, /*updatedBothSex*/ ctx[8]);
    			}

    			if (dirty & /*updatedMaleRank*/ 128 && input1.value !== /*updatedMaleRank*/ ctx[7]) {
    				set_input_value(input1, /*updatedMaleRank*/ ctx[7]);
    			}

    			if (dirty & /*updatedMaleNumber*/ 1024 && input2.value !== /*updatedMaleNumber*/ ctx[10]) {
    				set_input_value(input2, /*updatedMaleNumber*/ ctx[10]);
    			}

    			if (dirty & /*updatedFemaleRank*/ 64 && input3.value !== /*updatedFemaleRank*/ ctx[6]) {
    				set_input_value(input3, /*updatedFemaleRank*/ ctx[6]);
    			}

    			if (dirty & /*updatedFemaleNumber*/ 512 && input4.value !== /*updatedFemaleNumber*/ ctx[9]) {
    				set_input_value(input4, /*updatedFemaleNumber*/ ctx[9]);
    			}

    			if (dirty & /*updatedRatio*/ 2048 && input5.value !== /*updatedRatio*/ ctx[11]) {
    				set_input_value(input5, /*updatedRatio*/ ctx[11]);
    			}

    			if (!current || dirty & /*updatedYear*/ 16) set_data_dev(t28, /*updatedYear*/ ctx[4]);

    			if (dirty & /*updatedContinent*/ 32 && input6.value !== /*updatedContinent*/ ctx[5]) {
    				set_input_value(input6, /*updatedContinent*/ ctx[5]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16777216) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(115:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (107:16)           Loading spc...      {:then spc}
    function create_pending_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading spc...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(107:16)           Loading spc...      {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (146:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(146:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h3;
    	let t2;
    	let strong;
    	let t3_value = /*params*/ ctx[0].suicideCountry + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 13,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*spc*/ ctx[13], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "SPC Manager";
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("Edit SPC ");
    			strong = element("strong");
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			create_component(button.$$.fragment);
    			add_location(h1, file$8, 104, 4, 3381);
    			add_location(strong, file$8, 105, 17, 3420);
    			add_location(h3, file$8, 105, 4, 3407);
    			add_location(main, file$8, 103, 0, 3369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, h3);
    			append_dev(h3, t2);
    			append_dev(h3, strong);
    			append_dev(strong, t3);
    			append_dev(main, t4);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t5;
    			append_dev(main, t5);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].suicideCountry + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*spc*/ 8192 && promise !== (promise = /*spc*/ ctx[13]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[13] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16777216) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let { params = {} } = $$props;
    	let spc = {};
    	let updatedCountry = "";
    	let updatedYear = "";
    	let updatedContinent = "";
    	let updatedFemaleRank = "";
    	let updatedMaleRank = "";
    	let updatedBothSex = "";
    	let updatedFemaleNumber = "";
    	let updatedMaleNumber = "";
    	let updatedRatio = "";
    	let errorMSG = "";
    	onMount(getSPC1);

    	//GET
    	async function getSPC1() {
    		console.log("Fetching spc...");
    		const res = await fetch("/api/v2/spc-stats/" + params.suicideCountry + "/" + params.suicideYear);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(13, spc = json);
    			$$invalidate(3, updatedCountry = spc.country);
    			$$invalidate(8, updatedBothSex = spc.both_sex);
    			$$invalidate(7, updatedMaleRank = spc.male_rank);
    			$$invalidate(10, updatedMaleNumber = spc.male_number);
    			$$invalidate(6, updatedFemaleRank = spc.female_rank);
    			$$invalidate(9, updatedFemaleNumber = spc.female_number);
    			$$invalidate(11, updatedRatio = spc.ratio);
    			$$invalidate(4, updatedYear = params.suicideYear);
    			$$invalidate(5, updatedContinent = spc.continent);
    			console.log("Received " + spc.country);
    		} else {
    			$$invalidate(2, color = "danger");
    			$$invalidate(12, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	async function updateSpc() {
    		console.log("Updating spc..." + JSON.stringify(params.suicideCountry));

    		const res = await fetch("/api/v2/spc-stats/" + params.suicideCountry + "/" + params.suicideYear, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: updatedCountry,
    				both_sex: updatedBothSex,
    				male_rank: updatedMaleRank,
    				male_number: updatedMaleNumber,
    				female_rank: updatedFemaleRank,
    				female_number: updatedFemaleNumber,
    				ratio: updatedRatio,
    				year: params.suicideYear,
    				continent: updatedContinent
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			$$invalidate(1, visible = true);
    			getSPC1();

    			if (res.status == 200) {
    				$$invalidate(2, color = "success");
    				$$invalidate(12, errorMSG = updatedCountry + " actualizado correctamente");
    				console.log(updatedCountry + " updated");
    			} else if (res.status == 201) {
    				$$invalidate(12, errorMSG = updatedCountry + " actualizado correctamente");
    				$$invalidate(2, color = "success");
    				console.log(updatedCountry + " updated");
    			} else if (res.status == 404) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(12, errorMSG = updatedCountry + " no ha sido encontrado");
    				console.log("SUICIDE NOT FOUND");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(12, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<EditSpc> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditSpc", $$slots, []);
    	const func = () => $$invalidate(1, visible = false);

    	function input0_input_handler() {
    		updatedBothSex = this.value;
    		$$invalidate(8, updatedBothSex);
    	}

    	function input1_input_handler() {
    		updatedMaleRank = this.value;
    		$$invalidate(7, updatedMaleRank);
    	}

    	function input2_input_handler() {
    		updatedMaleNumber = this.value;
    		$$invalidate(10, updatedMaleNumber);
    	}

    	function input3_input_handler() {
    		updatedFemaleRank = this.value;
    		$$invalidate(6, updatedFemaleRank);
    	}

    	function input4_input_handler() {
    		updatedFemaleNumber = this.value;
    		$$invalidate(9, updatedFemaleNumber);
    	}

    	function input5_input_handler() {
    		updatedRatio = this.value;
    		$$invalidate(11, updatedRatio);
    	}

    	function input6_input_handler() {
    		updatedContinent = this.value;
    		$$invalidate(5, updatedContinent);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		params,
    		spc,
    		updatedCountry,
    		updatedYear,
    		updatedContinent,
    		updatedFemaleRank,
    		updatedMaleRank,
    		updatedBothSex,
    		updatedFemaleNumber,
    		updatedMaleNumber,
    		updatedRatio,
    		errorMSG,
    		getSPC1,
    		updateSpc
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("spc" in $$props) $$invalidate(13, spc = $$props.spc);
    		if ("updatedCountry" in $$props) $$invalidate(3, updatedCountry = $$props.updatedCountry);
    		if ("updatedYear" in $$props) $$invalidate(4, updatedYear = $$props.updatedYear);
    		if ("updatedContinent" in $$props) $$invalidate(5, updatedContinent = $$props.updatedContinent);
    		if ("updatedFemaleRank" in $$props) $$invalidate(6, updatedFemaleRank = $$props.updatedFemaleRank);
    		if ("updatedMaleRank" in $$props) $$invalidate(7, updatedMaleRank = $$props.updatedMaleRank);
    		if ("updatedBothSex" in $$props) $$invalidate(8, updatedBothSex = $$props.updatedBothSex);
    		if ("updatedFemaleNumber" in $$props) $$invalidate(9, updatedFemaleNumber = $$props.updatedFemaleNumber);
    		if ("updatedMaleNumber" in $$props) $$invalidate(10, updatedMaleNumber = $$props.updatedMaleNumber);
    		if ("updatedRatio" in $$props) $$invalidate(11, updatedRatio = $$props.updatedRatio);
    		if ("errorMSG" in $$props) $$invalidate(12, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		visible,
    		color,
    		updatedCountry,
    		updatedYear,
    		updatedContinent,
    		updatedFemaleRank,
    		updatedMaleRank,
    		updatedBothSex,
    		updatedFemaleNumber,
    		updatedMaleNumber,
    		updatedRatio,
    		errorMSG,
    		spc,
    		updateSpc,
    		getSPC1,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler
    	];
    }

    class EditSpc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditSpc",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get params() {
    		throw new Error("<EditSpc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditSpc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI2POVERTY\Home.svelte generated by Svelte v3.20.1 */

    const { console: console_1$5 } = globals;
    const file$9 = "src\\front\\GUI2POVERTY\\Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (213:4) {:then poverty}
    function create_then_block$4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block1_anchor;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[1],
    				isOpen: /*visible*/ ctx[0],
    				toggle: /*func*/ ctx[14],
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				responsive: true,
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getPovertyLoadInitialData*/ ctx[7]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deletePovertyAll*/ ctx[10]);
    	let if_block0 = /*page*/ ctx[4] != 1 && create_if_block_1$2(ctx);
    	let if_block1 = /*page*/ ctx[4] + 10 <= /*totalObj*/ ctx[3] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t0 = space();
    			create_component(table.$$.fragment);
    			t1 = space();
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(table, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};
    			if (dirty & /*color*/ 2) alert_changes.color = /*color*/ ctx[1];
    			if (dirty & /*visible*/ 1) alert_changes.isOpen = /*visible*/ ctx[0];
    			if (dirty & /*visible*/ 1) alert_changes.toggle = /*func*/ ctx[14];

    			if (dirty & /*$$scope, errorMSG*/ 8388640) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, poverty, newPoverty*/ 8388676) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (/*page*/ ctx[4] != 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[4] + 10 <= /*totalObj*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(213:4) {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (216:8) {#if errorMSG}
    function create_if_block_2$2(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("STATUS: ");
    			t1 = text(/*errorMSG*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 32) set_data_dev(t1, /*errorMSG*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(216:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (215:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_8$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[5] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*errorMSG*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(215:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (240:25) <Button outline  color="primary" on:click={insertPoverty}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insert");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(240:25) <Button outline  color=\\\"primary\\\" on:click={insertPoverty}>",
    		ctx
    	});

    	return block;
    }

    // (251:28) <Button outline color="danger" on:click="{deletePoverty(poverty.country)}">
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(251:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deletePoverty(poverty.country)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (243:16) {#each poverty as poverty}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*poverty*/ ctx[6].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*poverty*/ ctx[6].under_190 + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*poverty*/ ctx[6].under_320 + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*poverty*/ ctx[6].under_550 + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*poverty*/ ctx[6].year + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*poverty*/ ctx[6].continent + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deletePoverty*/ ctx[9](/*poverty*/ ctx[6].country))) /*deletePoverty*/ ctx[9](/*poverty*/ ctx[6].country).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			create_component(button.$$.fragment);
    			t12 = space();
    			attr_dev(a, "href", a_href_value = "#/poverty-stats/" + /*poverty*/ ctx[6].country + "/" + /*poverty*/ ctx[6].year);
    			add_location(a, file$9, 244, 28, 8195);
    			add_location(td0, file$9, 244, 24, 8191);
    			add_location(td1, file$9, 245, 24, 8306);
    			add_location(td2, file$9, 246, 24, 8360);
    			add_location(td3, file$9, 247, 24, 8414);
    			add_location(td4, file$9, 248, 24, 8468);
    			add_location(td5, file$9, 249, 24, 8517);
    			add_location(td6, file$9, 250, 24, 8571);
    			add_location(tr, file$9, 243, 20, 8161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			mount_component(button, td6, null);
    			append_dev(tr, t12);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*poverty*/ 64) && t0_value !== (t0_value = /*poverty*/ ctx[6].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*poverty*/ 64 && a_href_value !== (a_href_value = "#/poverty-stats/" + /*poverty*/ ctx[6].country + "/" + /*poverty*/ ctx[6].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*poverty*/ 64) && t2_value !== (t2_value = /*poverty*/ ctx[6].under_190 + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*poverty*/ 64) && t4_value !== (t4_value = /*poverty*/ ctx[6].under_320 + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*poverty*/ 64) && t6_value !== (t6_value = /*poverty*/ ctx[6].under_550 + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*poverty*/ 64) && t8_value !== (t8_value = /*poverty*/ ctx[6].year + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*poverty*/ 64) && t10_value !== (t10_value = /*poverty*/ ctx[6].continent + "")) set_data_dev(t10, t10_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(243:16) {#each poverty as poverty}",
    		ctx
    	});

    	return block;
    }

    // (221:8) <Table responsive>
    function create_default_slot_5$1(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t12;
    	let td1;
    	let input1;
    	let t13;
    	let td2;
    	let input2;
    	let t14;
    	let td3;
    	let input3;
    	let t15;
    	let td4;
    	let input4;
    	let t16;
    	let td5;
    	let input5;
    	let t17;
    	let td6;
    	let t18;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertPoverty*/ ctx[8]);
    	let each_value = /*poverty*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Country";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Under 190";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Under 320";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Under 550";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Year";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Continent";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t12 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t13 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t14 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t15 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t16 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t17 = space();
    			td6 = element("td");
    			create_component(button.$$.fragment);
    			t18 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$9, 223, 20, 7227);
    			add_location(th1, file$9, 224, 20, 7265);
    			add_location(th2, file$9, 225, 20, 7305);
    			add_location(th3, file$9, 226, 20, 7345);
    			add_location(th4, file$9, 227, 20, 7385);
    			add_location(th5, file$9, 228, 20, 7420);
    			add_location(tr0, file$9, 222, 16, 7201);
    			add_location(thead, file$9, 221, 12, 7176);
    			add_location(input0, file$9, 233, 24, 7552);
    			add_location(td0, file$9, 233, 20, 7548);
    			add_location(input1, file$9, 234, 24, 7624);
    			add_location(td1, file$9, 234, 20, 7620);
    			add_location(input2, file$9, 235, 24, 7698);
    			add_location(td2, file$9, 235, 20, 7694);
    			add_location(input3, file$9, 236, 24, 7772);
    			add_location(td3, file$9, 236, 20, 7768);
    			add_location(input4, file$9, 237, 24, 7846);
    			add_location(td4, file$9, 237, 20, 7842);
    			add_location(input5, file$9, 238, 24, 7915);
    			add_location(td5, file$9, 238, 20, 7911);
    			add_location(td6, file$9, 239, 20, 7985);
    			add_location(tr1, file$9, 232, 16, 7522);
    			add_location(tbody, file$9, 231, 12, 7497);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newPoverty*/ ctx[2].country);
    			append_dev(tr1, t12);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newPoverty*/ ctx[2].under_190);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newPoverty*/ ctx[2].under_320);
    			append_dev(tr1, t14);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newPoverty*/ ctx[2].under_550);
    			append_dev(tr1, t15);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newPoverty*/ ctx[2].year);
    			append_dev(tr1, t16);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newPoverty*/ ctx[2].continent);
    			append_dev(tr1, t17);
    			append_dev(tr1, td6);
    			mount_component(button, td6, null);
    			append_dev(tbody, t18);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[17]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[18]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[19]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[20])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newPoverty*/ 4 && input0.value !== /*newPoverty*/ ctx[2].country) {
    				set_input_value(input0, /*newPoverty*/ ctx[2].country);
    			}

    			if (dirty & /*newPoverty*/ 4 && input1.value !== /*newPoverty*/ ctx[2].under_190) {
    				set_input_value(input1, /*newPoverty*/ ctx[2].under_190);
    			}

    			if (dirty & /*newPoverty*/ 4 && input2.value !== /*newPoverty*/ ctx[2].under_320) {
    				set_input_value(input2, /*newPoverty*/ ctx[2].under_320);
    			}

    			if (dirty & /*newPoverty*/ 4 && input3.value !== /*newPoverty*/ ctx[2].under_550) {
    				set_input_value(input3, /*newPoverty*/ ctx[2].under_550);
    			}

    			if (dirty & /*newPoverty*/ 4 && input4.value !== /*newPoverty*/ ctx[2].year) {
    				set_input_value(input4, /*newPoverty*/ ctx[2].year);
    			}

    			if (dirty & /*newPoverty*/ 4 && input5.value !== /*newPoverty*/ ctx[2].continent) {
    				set_input_value(input5, /*newPoverty*/ ctx[2].continent);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*deletePoverty, poverty*/ 576) {
    				each_value = /*poverty*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(221:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (257:8) <Button color="primary" on:click="{getPovertyLoadInitialData}">
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reiniciar ejemplos iniciales");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(257:8) <Button color=\\\"primary\\\" on:click=\\\"{getPovertyLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (260:8) <Button color="danger" on:click="{deletePovertyAll}">
    function create_default_slot_3$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(260:8) <Button color=\\\"danger\\\" on:click=\\\"{deletePovertyAll}\\\">",
    		ctx
    	});

    	return block;
    }

    // (263:8) {#if page!=1}
    function create_if_block_1$2(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*getPreviousPage*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(263:8) {#if page!=1}",
    		ctx
    	});

    	return block;
    }

    // (264:8) <Button outline color="success" on:click="{getPreviousPage}">
    function create_default_slot_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Atras");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(264:8) <Button outline color=\\\"success\\\" on:click=\\\"{getPreviousPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (268:9) {#if (page+10) <= totalObj}
    function create_if_block$7(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*getNextPage*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(268:9) {#if (page+10) <= totalObj}",
    		ctx
    	});

    	return block;
    }

    // (269:8) <Button outline color="success" on:click="{getNextPage}">
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Siguiente");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(269:8) <Button outline color=\\\"success\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (211:20)           Loading poverty...      {:then poverty}
    function create_pending_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading poverty...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(211:20)           Loading poverty...      {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (276:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(276:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let promise;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let t3;
    	let br2;
    	let t4;
    	let br3;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*poverty*/ ctx[6], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = space();
    			br2 = element("br");
    			t4 = space();
    			br3 = element("br");
    			add_location(br0, file$9, 273, 4, 9346);
    			add_location(br1, file$9, 274, 4, 9356);
    			add_location(br2, file$9, 276, 4, 9436);
    			add_location(br3, file$9, 277, 4, 9446);
    			add_location(main, file$9, 208, 0, 6888);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t0;
    			append_dev(main, t0);
    			append_dev(main, br0);
    			append_dev(main, t1);
    			append_dev(main, br1);
    			append_dev(main, t2);
    			mount_component(button, main, null);
    			append_dev(main, t3);
    			append_dev(main, br2);
    			append_dev(main, t4);
    			append_dev(main, br3);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*poverty*/ 64 && promise !== (promise = /*poverty*/ ctx[6]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";

    	let newPoverty = {
    		country: "",
    		under_190: "",
    		under_320: "",
    		under_550: "",
    		year: "",
    		continent: ""
    	};

    	let poverty = [];
    	let totalObj = poverty.length;
    	let page = 1;
    	let errorMSG = "";
    	onMount(getPoverty);

    	//GET Limit ok
    	async function getPoverty() {
    		console.log("Fetching poverty...");
    		const res = await fetch("/api/v1/poverty-stats?limit=10&offset=" + page); //obtener limit y offset
    		const res2 = await fetch("/api/v1/poverty-stats"); //obtener datos

    		if (res.ok && res2.ok) {
    			const json = await res.json();
    			const json2 = await res2.json();
    			$$invalidate(6, poverty = json); //pagina
    			$$invalidate(3, totalObj = json2.length); //datos
    			console.log("Received " + poverty.length + " data poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//GET LoadInitialData
    	async function getPovertyLoadInitialData() {
    		console.log("Fetching poverty...");

    		const msg = await fetch("/api/v1/poverty-stats/loadInitialData").then(function (res) {
    			//mensaje de alerta
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(5, errorMSG = "Objetos cargados correctamente");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});

    		const elements = await fetch("/api/v1/poverty-stats/loadInitialData"); //datos cargados
    		const jsonElements = await elements.json();
    		$$invalidate(4, page = 1);
    		$$invalidate(3, totalObj = jsonElements.length);
    		console.log("ELEMENTOS: " + totalObj);
    		const res = await fetch("/api/v1/poverty-stats?limit=10&offset=1"); //datos mostrados

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(6, poverty = json);
    			console.log("Loading " + poverty.length + " objects");
    			console.log("Received " + poverty.length + " poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//INSERT
    	async function insertPoverty() {
    		console.log("Inserting poverty..." + JSON.stringify(newPoverty));

    		const res = await fetch("/api/v1/poverty-stats", {
    			method: "POST",
    			body: JSON.stringify(newPoverty),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(3, totalObj++, totalObj);
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(5, errorMSG = newPoverty.country + " insertado correctamente");
    				console.log(newPoverty.country + " updated");
    				getPoverty();
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos o que no estén contenidos en la tabla.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	//DELETE
    	async function deletePoverty(country) {
    		const res = await fetch("/api/v1/poverty-stats/" + country, { method: "DELETE" }).then(function (res) {
    			getPoverty();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(3, totalObj--, totalObj);
    				console.log("ELEMENTO: " + totalObj + " borrado.");
    				$$invalidate(1, color = "success");
    				$$invalidate(5, errorMSG = "Objeto borrado correctamente.");
    				console.log("Deleted " + country + " poverty.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = "Ha ocurrido un fallo.");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deletePovertyAll() {
    		const res = await fetch("/api/v1/poverty-stats/", { method: "DELETE" }).then(function (res) {
    			getPoverty();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(4, page = 1);
    				$$invalidate(3, totalObj = 0);
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(5, errorMSG = "Objetos borrados correctamente.");
    				console.log("Deleted all poverty.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = "Ha ocurrido un fallo.");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	// Next Page
    	async function getNextPage() {
    		$$invalidate(4, page += 10);

    		if (page > totalObj) {
    			$$invalidate(4, page -= 10);
    		}

    		await console.log(page);
    		console.log("Fetching poverty...");
    		const res = await fetch("/api/v1/poverty-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(6, poverty = json);
    			console.log("Received " + poverty.length + " poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//Previus Page
    	async function getPreviousPage() {
    		if (page - 10 >= 0) {
    			$$invalidate(4, page -= 10);
    		}

    		await console.log(page);
    		console.log("Fetching poverty...");
    		const res = await fetch("/api/v1/poverty-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(6, poverty = json);
    			console.log("Received " + poverty.length + " poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const func = () => $$invalidate(0, visible = false);

    	function input0_input_handler() {
    		newPoverty.country = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	function input1_input_handler() {
    		newPoverty.under_190 = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	function input2_input_handler() {
    		newPoverty.under_320 = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	function input3_input_handler() {
    		newPoverty.under_550 = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	function input4_input_handler() {
    		newPoverty.year = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	function input5_input_handler() {
    		newPoverty.continent = this.value;
    		$$invalidate(2, newPoverty);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		newPoverty,
    		poverty,
    		totalObj,
    		page,
    		errorMSG,
    		getPoverty,
    		getPovertyLoadInitialData,
    		insertPoverty,
    		deletePoverty,
    		deletePovertyAll,
    		getNextPage,
    		getPreviousPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("newPoverty" in $$props) $$invalidate(2, newPoverty = $$props.newPoverty);
    		if ("poverty" in $$props) $$invalidate(6, poverty = $$props.poverty);
    		if ("totalObj" in $$props) $$invalidate(3, totalObj = $$props.totalObj);
    		if ("page" in $$props) $$invalidate(4, page = $$props.page);
    		if ("errorMSG" in $$props) $$invalidate(5, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		color,
    		newPoverty,
    		totalObj,
    		page,
    		errorMSG,
    		poverty,
    		getPovertyLoadInitialData,
    		insertPoverty,
    		deletePoverty,
    		deletePovertyAll,
    		getNextPage,
    		getPreviousPage,
    		getPoverty,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	];
    }

    class Home$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\front\GUI2POVERTY\EditPoverty.svelte generated by Svelte v3.20.1 */

    const { console: console_1$6 } = globals;
    const file$a = "src\\front\\GUI2POVERTY\\EditPoverty.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$5(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$5.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (97:4) {:then poverty}
    function create_then_block$5(ctx) {
    	let t;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[1],
    				isOpen: /*visible*/ ctx[0],
    				toggle: /*func*/ ctx[13],
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				responsive: true,
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t = space();
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};
    			if (dirty & /*color*/ 2) alert_changes.color = /*color*/ ctx[1];
    			if (dirty & /*visible*/ 1) alert_changes.isOpen = /*visible*/ ctx[0];
    			if (dirty & /*visible*/ 1) alert_changes.toggle = /*func*/ ctx[13];

    			if (dirty & /*$$scope, errorMSG*/ 1048832) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedContinent, updatedYear, updatedUnder550, updatedUnder320, updatedUnder190, updatedCountry*/ 1048828) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$5.name,
    		type: "then",
    		source: "(97:4) {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (100:8) {#if errorMSG}
    function create_if_block$8(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("STATUS: ");
    			t1 = text(/*errorMSG*/ ctx[8]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 256) set_data_dev(t1, /*errorMSG*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(100:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (99:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_3$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[8] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*errorMSG*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(99:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (124:25) <Button outline  color="primary" on:click={updatePoverty}>
    function create_default_slot_2$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$6.name,
    		type: "slot",
    		source: "(124:25) <Button outline  color=\\\"primary\\\" on:click={updatePoverty}>",
    		ctx
    	});

    	return block;
    }

    // (105:8) <Table responsive>
    function create_default_slot_1$6(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let th6;
    	let input0;
    	let t12;
    	let th7;
    	let input1;
    	let t13;
    	let th8;
    	let input2;
    	let t14;
    	let th9;
    	let input3;
    	let t15;
    	let th10;
    	let input4;
    	let t16;
    	let th11;
    	let input5;
    	let t17;
    	let td;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_2$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updatePoverty*/ ctx[10]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Country*";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Under_190";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Under_320";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Under_550";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Year*";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Continent";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			th6 = element("th");
    			input0 = element("input");
    			t12 = space();
    			th7 = element("th");
    			input1 = element("input");
    			t13 = space();
    			th8 = element("th");
    			input2 = element("input");
    			t14 = space();
    			th9 = element("th");
    			input3 = element("input");
    			t15 = space();
    			th10 = element("th");
    			input4 = element("input");
    			t16 = space();
    			th11 = element("th");
    			input5 = element("input");
    			t17 = space();
    			td = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$a, 107, 20, 3447);
    			add_location(th1, file$a, 108, 20, 3486);
    			add_location(th2, file$a, 109, 20, 3526);
    			add_location(th3, file$a, 110, 20, 3566);
    			add_location(th4, file$a, 111, 20, 3606);
    			add_location(th5, file$a, 112, 20, 3642);
    			add_location(tr0, file$a, 106, 16, 3421);
    			add_location(thead, file$a, 105, 12, 3396);
    			add_location(input0, file$a, 117, 24, 3774);
    			add_location(th6, file$a, 117, 20, 3770);
    			add_location(input1, file$a, 118, 24, 3842);
    			add_location(th7, file$a, 118, 20, 3838);
    			add_location(input2, file$a, 119, 24, 3911);
    			add_location(th8, file$a, 119, 20, 3907);
    			add_location(input3, file$a, 120, 24, 3980);
    			add_location(th9, file$a, 120, 20, 3976);
    			add_location(input4, file$a, 121, 24, 4049);
    			add_location(th10, file$a, 121, 20, 4045);
    			add_location(input5, file$a, 122, 24, 4114);
    			add_location(th11, file$a, 122, 20, 4110);
    			add_location(td, file$a, 123, 20, 4180);
    			add_location(tr1, file$a, 116, 16, 3744);
    			add_location(tbody, file$a, 115, 12, 3719);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th6);
    			append_dev(th6, input0);
    			set_input_value(input0, /*updatedCountry*/ ctx[2]);
    			append_dev(tr1, t12);
    			append_dev(tr1, th7);
    			append_dev(th7, input1);
    			set_input_value(input1, /*updatedUnder190*/ ctx[3]);
    			append_dev(tr1, t13);
    			append_dev(tr1, th8);
    			append_dev(th8, input2);
    			set_input_value(input2, /*updatedUnder320*/ ctx[4]);
    			append_dev(tr1, t14);
    			append_dev(tr1, th9);
    			append_dev(th9, input3);
    			set_input_value(input3, /*updatedUnder550*/ ctx[5]);
    			append_dev(tr1, t15);
    			append_dev(tr1, th10);
    			append_dev(th10, input4);
    			set_input_value(input4, /*updatedYear*/ ctx[6]);
    			append_dev(tr1, t16);
    			append_dev(tr1, th11);
    			append_dev(th11, input5);
    			set_input_value(input5, /*updatedContinent*/ ctx[7]);
    			append_dev(tr1, t17);
    			append_dev(tr1, td);
    			mount_component(button, td, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[16]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[17]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[18]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[19])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*updatedCountry*/ 4 && input0.value !== /*updatedCountry*/ ctx[2]) {
    				set_input_value(input0, /*updatedCountry*/ ctx[2]);
    			}

    			if (dirty & /*updatedUnder190*/ 8 && input1.value !== /*updatedUnder190*/ ctx[3]) {
    				set_input_value(input1, /*updatedUnder190*/ ctx[3]);
    			}

    			if (dirty & /*updatedUnder320*/ 16 && input2.value !== /*updatedUnder320*/ ctx[4]) {
    				set_input_value(input2, /*updatedUnder320*/ ctx[4]);
    			}

    			if (dirty & /*updatedUnder550*/ 32 && input3.value !== /*updatedUnder550*/ ctx[5]) {
    				set_input_value(input3, /*updatedUnder550*/ ctx[5]);
    			}

    			if (dirty & /*updatedYear*/ 64 && input4.value !== /*updatedYear*/ ctx[6]) {
    				set_input_value(input4, /*updatedYear*/ ctx[6]);
    			}

    			if (dirty & /*updatedContinent*/ 128 && input5.value !== /*updatedContinent*/ ctx[7]) {
    				set_input_value(input5, /*updatedContinent*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(105:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (95:20)           Loading poverty...      {:then poverty}
    function create_pending_block$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading poverty...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$5.name,
    		type: "pending",
    		source: "(95:20)           Loading poverty...      {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (129:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(129:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let promise;
    	let t;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$5,
    		then: create_then_block$5,
    		catch: create_catch_block$5,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*poverty*/ ctx[9], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			t = space();
    			create_component(button.$$.fragment);
    			add_location(main, file$a, 93, 0, 3111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t;
    			append_dev(main, t);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*poverty*/ 512 && promise !== (promise = /*poverty*/ ctx[9]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let visible = false;
    	let color = "danger";
    	let poverty = {};
    	let updatedCountry = "";
    	let updatedUnder190 = "";
    	let updatedUnder320 = "";
    	let updatedUnder550 = "";
    	let updatedYear = "";
    	let updatedContinent = "";
    	let errorMSG = "";
    	onMount(getPoverty);

    	//GET OBJECT
    	async function getPoverty() {
    		console.log("Fetching poverty...");
    		const res = await fetch("/api/v1/poverty-stats?country=" + params.country + "&year=" + params.year);

    		if (res.ok) {
    			console.log("Ok:");
    			console.log("data poverty of " + params.country + " found");
    			const json = await res.json();
    			$$invalidate(9, poverty = json);
    			$$invalidate(2, updatedCountry = poverty.country);
    			$$invalidate(3, updatedUnder190 = poverty.under_190);
    			$$invalidate(4, updatedUnder320 = poverty.under_320);
    			$$invalidate(5, updatedUnder550 = poverty.under_550);
    			$$invalidate(6, updatedYear = poverty.year);
    			$$invalidate(7, updatedContinent = poverty.continent);
    			console.log("Received poverty.");
    		} else {
    			$$invalidate(8, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	async function updatePoverty() {
    		console.log("Updating poverty...");

    		const res = await fetch("/api/v1/poverty-stats/" + params.country + "/" + params.year, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: params.country,
    				under_190: updatedUnder190,
    				under_320: updatedUnder320,
    				under_550: updatedUnder550,
    				year: params.year,
    				continent: updatedContinent
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			$$invalidate(0, visible = true);
    			getPoverty();

    			if (res.status == 200) {
    				$$invalidate(1, color = "success");
    				$$invalidate(8, errorMSG = params.country + " actualizado correctamente");
    				console.log(params.country + " updated");
    			} else if (res.status == 201) {
    				$$invalidate(8, errorMSG = params.country + " actualizado correctamente");
    				$$invalidate(1, color = "success");
    				console.log(params.country + " updated");
    			} else if (res.status == 404) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = params.country + " no ha sido encontrado");
    				console.log("SUICIDE NOT FOUND");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<EditPoverty> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditPoverty", $$slots, []);
    	const func = () => $$invalidate(0, visible = false);

    	function input0_input_handler() {
    		updatedCountry = this.value;
    		$$invalidate(2, updatedCountry);
    	}

    	function input1_input_handler() {
    		updatedUnder190 = this.value;
    		$$invalidate(3, updatedUnder190);
    	}

    	function input2_input_handler() {
    		updatedUnder320 = this.value;
    		$$invalidate(4, updatedUnder320);
    	}

    	function input3_input_handler() {
    		updatedUnder550 = this.value;
    		$$invalidate(5, updatedUnder550);
    	}

    	function input4_input_handler() {
    		updatedYear = this.value;
    		$$invalidate(6, updatedYear);
    	}

    	function input5_input_handler() {
    		updatedContinent = this.value;
    		$$invalidate(7, updatedContinent);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(11, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		params,
    		visible,
    		color,
    		poverty,
    		updatedCountry,
    		updatedUnder190,
    		updatedUnder320,
    		updatedUnder550,
    		updatedYear,
    		updatedContinent,
    		errorMSG,
    		getPoverty,
    		updatePoverty
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(11, params = $$props.params);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("poverty" in $$props) $$invalidate(9, poverty = $$props.poverty);
    		if ("updatedCountry" in $$props) $$invalidate(2, updatedCountry = $$props.updatedCountry);
    		if ("updatedUnder190" in $$props) $$invalidate(3, updatedUnder190 = $$props.updatedUnder190);
    		if ("updatedUnder320" in $$props) $$invalidate(4, updatedUnder320 = $$props.updatedUnder320);
    		if ("updatedUnder550" in $$props) $$invalidate(5, updatedUnder550 = $$props.updatedUnder550);
    		if ("updatedYear" in $$props) $$invalidate(6, updatedYear = $$props.updatedYear);
    		if ("updatedContinent" in $$props) $$invalidate(7, updatedContinent = $$props.updatedContinent);
    		if ("errorMSG" in $$props) $$invalidate(8, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		color,
    		updatedCountry,
    		updatedUnder190,
    		updatedUnder320,
    		updatedUnder550,
    		updatedYear,
    		updatedContinent,
    		errorMSG,
    		poverty,
    		updatePoverty,
    		params,
    		getPoverty,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	];
    }

    class EditPoverty extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { params: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditPoverty",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get params() {
    		throw new Error("<EditPoverty>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditPoverty>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI3LQ\Home.svelte generated by Svelte v3.20.1 */

    const { console: console_1$7 } = globals;
    const file$b = "src\\front\\GUI3LQ\\Home.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import{          onMount      }
    function create_catch_block$6(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$6.name,
    		type: "catch",
    		source: "(1:0) <script>      import{          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (190:4) {:then lq}
    function create_then_block$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getLQLoadInitialData*/ ctx[3]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteLQALL*/ ctx[6]);

    	const button2 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*getPreviewPage*/ ctx[8]);

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*getNextPage*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    			t0 = space();
    			create_component(button0.$$.fragment);
    			t1 = space();
    			create_component(button1.$$.fragment);
    			t2 = space();
    			create_component(button2.$$.fragment);
    			t3 = space();
    			create_component(button3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(button3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, lq, newLQ*/ 536870917) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(button3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$6.name,
    		type: "then",
    		source: "(190:4) {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (224:28) <Button outline color="primary" on:click={insertLQ}>
    function create_default_slot_7$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insert");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$2.name,
    		type: "slot",
    		source: "(224:28) <Button outline color=\\\"primary\\\" on:click={insertLQ}>",
    		ctx
    	});

    	return block;
    }

    // (239:28) <Button outline color="danger" on:click="{deleteLQ(lifeq.country)}">
    function create_default_slot_6$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(239:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteLQ(lifeq.country)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (226:20) {#each lq as lifeq}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*lifeq*/ ctx[26].rank + "";
    	let t0;
    	let t1;
    	let td1;
    	let a0;
    	let t2_value = /*lifeq*/ ctx[26].country + "";
    	let t2;
    	let a0_href_value;
    	let t3;
    	let td2;
    	let t4_value = /*lifeq*/ ctx[26].stability + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*lifeq*/ ctx[26].right + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*lifeq*/ ctx[26].health + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*lifeq*/ ctx[26].security + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*lifeq*/ ctx[26].climate + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*lifeq*/ ctx[26].costs + "";
    	let t14;
    	let t15;
    	let td8;
    	let t16_value = /*lifeq*/ ctx[26].popularity + "";
    	let t16;
    	let t17;
    	let td9;
    	let t18_value = /*lifeq*/ ctx[26].total + "";
    	let t18;
    	let t19;
    	let td10;
    	let a1;
    	let t20_value = /*lifeq*/ ctx[26].year + "";
    	let t20;
    	let a1_href_value;
    	let t21;
    	let td11;
    	let t22;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deleteLQ*/ ctx[5](/*lifeq*/ ctx[26].country))) /*deleteLQ*/ ctx[5](/*lifeq*/ ctx[26].country).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a0 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td10 = element("td");
    			a1 = element("a");
    			t20 = text(t20_value);
    			t21 = space();
    			td11 = element("td");
    			create_component(button.$$.fragment);
    			t22 = space();
    			add_location(td0, file$b, 227, 24, 7417);
    			attr_dev(a0, "href", a0_href_value = "#/lq-stats/" + /*lifeq*/ ctx[26].country + "/" + /*lifeq*/ ctx[26].year);
    			add_location(a0, file$b, 228, 28, 7468);
    			add_location(td1, file$b, 228, 24, 7464);
    			add_location(td2, file$b, 229, 24, 7568);
    			add_location(td3, file$b, 230, 24, 7620);
    			add_location(td4, file$b, 231, 24, 7668);
    			add_location(td5, file$b, 232, 24, 7717);
    			add_location(td6, file$b, 233, 24, 7768);
    			add_location(td7, file$b, 234, 24, 7818);
    			add_location(td8, file$b, 235, 24, 7866);
    			add_location(td9, file$b, 236, 24, 7919);
    			attr_dev(a1, "href", a1_href_value = "#/lq-stats/" + /*lifeq*/ ctx[26].country + "/" + /*lifeq*/ ctx[26].year);
    			add_location(a1, file$b, 237, 28, 7971);
    			add_location(td10, file$b, 237, 24, 7967);
    			add_location(td11, file$b, 238, 24, 8068);
    			add_location(tr, file$b, 226, 20, 7387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a0);
    			append_dev(a0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			append_dev(td7, t14);
    			append_dev(tr, t15);
    			append_dev(tr, td8);
    			append_dev(td8, t16);
    			append_dev(tr, t17);
    			append_dev(tr, td9);
    			append_dev(td9, t18);
    			append_dev(tr, t19);
    			append_dev(tr, td10);
    			append_dev(td10, a1);
    			append_dev(a1, t20);
    			append_dev(tr, t21);
    			append_dev(tr, td11);
    			mount_component(button, td11, null);
    			append_dev(tr, t22);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*lq*/ 4) && t0_value !== (t0_value = /*lifeq*/ ctx[26].rank + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*lq*/ 4) && t2_value !== (t2_value = /*lifeq*/ ctx[26].country + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*lq*/ 4 && a0_href_value !== (a0_href_value = "#/lq-stats/" + /*lifeq*/ ctx[26].country + "/" + /*lifeq*/ ctx[26].year)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*lq*/ 4) && t4_value !== (t4_value = /*lifeq*/ ctx[26].stability + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*lq*/ 4) && t6_value !== (t6_value = /*lifeq*/ ctx[26].right + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*lq*/ 4) && t8_value !== (t8_value = /*lifeq*/ ctx[26].health + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*lq*/ 4) && t10_value !== (t10_value = /*lifeq*/ ctx[26].security + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*lq*/ 4) && t12_value !== (t12_value = /*lifeq*/ ctx[26].climate + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*lq*/ 4) && t14_value !== (t14_value = /*lifeq*/ ctx[26].costs + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*lq*/ 4) && t16_value !== (t16_value = /*lifeq*/ ctx[26].popularity + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty & /*lq*/ 4) && t18_value !== (t18_value = /*lifeq*/ ctx[26].total + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*lq*/ 4) && t20_value !== (t20_value = /*lifeq*/ ctx[26].year + "")) set_data_dev(t20, t20_value);

    			if (!current || dirty & /*lq*/ 4 && a1_href_value !== (a1_href_value = "#/lq-stats/" + /*lifeq*/ ctx[26].country + "/" + /*lifeq*/ ctx[26].year)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(226:20) {#each lq as lifeq}",
    		ctx
    	});

    	return block;
    }

    // (192:8) <Table bordered>
    function create_default_slot_5$2(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let th8;
    	let t17;
    	let th9;
    	let t19;
    	let th10;
    	let t21;
    	let th11;
    	let t23;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t24;
    	let td1;
    	let input1;
    	let t25;
    	let td2;
    	let input2;
    	let t26;
    	let td3;
    	let input3;
    	let t27;
    	let td4;
    	let input4;
    	let t28;
    	let td5;
    	let input5;
    	let t29;
    	let td6;
    	let input6;
    	let t30;
    	let td7;
    	let input7;
    	let t31;
    	let td8;
    	let input8;
    	let t32;
    	let td9;
    	let input9;
    	let t33;
    	let td10;
    	let input10;
    	let t34;
    	let td11;
    	let input11;
    	let t35;
    	let td12;
    	let t36;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_7$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertLQ*/ ctx[4]);
    	let each_value = /*lq*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Rank";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Country";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Stability";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Right";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Health";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Security";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Climate";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Costs";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "Popularity";
    			t17 = space();
    			th9 = element("th");
    			th9.textContent = "Total";
    			t19 = space();
    			th10 = element("th");
    			th10.textContent = "Year";
    			t21 = space();
    			th11 = element("th");
    			th11.textContent = "Continent";
    			t23 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t24 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t25 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t26 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t27 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t28 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t29 = space();
    			td6 = element("td");
    			input6 = element("input");
    			t30 = space();
    			td7 = element("td");
    			input7 = element("input");
    			t31 = space();
    			td8 = element("td");
    			input8 = element("input");
    			t32 = space();
    			td9 = element("td");
    			input9 = element("input");
    			t33 = space();
    			td10 = element("td");
    			input10 = element("input");
    			t34 = space();
    			td11 = element("td");
    			input11 = element("input");
    			t35 = space();
    			td12 = element("td");
    			create_component(button.$$.fragment);
    			t36 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$b, 194, 24, 5769);
    			add_location(th1, file$b, 195, 24, 5808);
    			add_location(th2, file$b, 196, 24, 5850);
    			add_location(th3, file$b, 197, 24, 5894);
    			add_location(th4, file$b, 198, 24, 5934);
    			add_location(th5, file$b, 199, 24, 5975);
    			add_location(th6, file$b, 200, 24, 6018);
    			add_location(th7, file$b, 201, 24, 6060);
    			add_location(th8, file$b, 202, 24, 6100);
    			add_location(th9, file$b, 203, 24, 6145);
    			add_location(th10, file$b, 204, 24, 6185);
    			add_location(th11, file$b, 205, 24, 6224);
    			add_location(tr0, file$b, 193, 20, 5739);
    			add_location(thead, file$b, 192, 16, 5710);
    			add_location(input0, file$b, 211, 28, 6378);
    			add_location(td0, file$b, 211, 24, 6374);
    			add_location(input1, file$b, 212, 28, 6446);
    			add_location(td1, file$b, 212, 24, 6442);
    			add_location(input2, file$b, 213, 28, 6517);
    			add_location(td2, file$b, 213, 24, 6513);
    			add_location(input3, file$b, 214, 28, 6590);
    			add_location(td3, file$b, 214, 24, 6586);
    			add_location(input4, file$b, 215, 28, 6659);
    			add_location(td4, file$b, 215, 24, 6655);
    			add_location(input5, file$b, 216, 28, 6729);
    			add_location(td5, file$b, 216, 24, 6725);
    			add_location(input6, file$b, 217, 28, 6801);
    			add_location(td6, file$b, 217, 24, 6797);
    			add_location(input7, file$b, 218, 28, 6872);
    			add_location(td7, file$b, 218, 24, 6868);
    			add_location(input8, file$b, 219, 28, 6941);
    			add_location(td8, file$b, 219, 24, 6937);
    			add_location(input9, file$b, 220, 28, 7015);
    			add_location(td9, file$b, 220, 24, 7011);
    			add_location(input10, file$b, 221, 28, 7084);
    			add_location(td10, file$b, 221, 24, 7080);
    			add_location(input11, file$b, 222, 28, 7152);
    			add_location(td11, file$b, 222, 24, 7148);
    			add_location(td12, file$b, 223, 24, 7221);
    			add_location(tr1, file$b, 210, 20, 6344);
    			add_location(tbody, file$b, 209, 16, 6315);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(tr0, t11);
    			append_dev(tr0, th6);
    			append_dev(tr0, t13);
    			append_dev(tr0, th7);
    			append_dev(tr0, t15);
    			append_dev(tr0, th8);
    			append_dev(tr0, t17);
    			append_dev(tr0, th9);
    			append_dev(tr0, t19);
    			append_dev(tr0, th10);
    			append_dev(tr0, t21);
    			append_dev(tr0, th11);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newLQ*/ ctx[0].rank);
    			append_dev(tr1, t24);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newLQ*/ ctx[0].country);
    			append_dev(tr1, t25);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newLQ*/ ctx[0].stability);
    			append_dev(tr1, t26);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newLQ*/ ctx[0].right);
    			append_dev(tr1, t27);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newLQ*/ ctx[0].health);
    			append_dev(tr1, t28);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newLQ*/ ctx[0].security);
    			append_dev(tr1, t29);
    			append_dev(tr1, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*newLQ*/ ctx[0].climate);
    			append_dev(tr1, t30);
    			append_dev(tr1, td7);
    			append_dev(td7, input7);
    			set_input_value(input7, /*newLQ*/ ctx[0].costs);
    			append_dev(tr1, t31);
    			append_dev(tr1, td8);
    			append_dev(td8, input8);
    			set_input_value(input8, /*newLQ*/ ctx[0].popularity);
    			append_dev(tr1, t32);
    			append_dev(tr1, td9);
    			append_dev(td9, input9);
    			set_input_value(input9, /*newLQ*/ ctx[0].total);
    			append_dev(tr1, t33);
    			append_dev(tr1, td10);
    			append_dev(td10, input10);
    			set_input_value(input10, /*newLQ*/ ctx[0].year);
    			append_dev(tr1, t34);
    			append_dev(tr1, td11);
    			append_dev(td11, input11);
    			set_input_value(input11, /*newLQ*/ ctx[0].continent);
    			append_dev(tr1, t35);
    			append_dev(tr1, td12);
    			mount_component(button, td12, null);
    			append_dev(tbody, t36);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[16]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[17]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[18]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[19]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[20]),
    				listen_dev(input7, "input", /*input7_input_handler*/ ctx[21]),
    				listen_dev(input8, "input", /*input8_input_handler*/ ctx[22]),
    				listen_dev(input9, "input", /*input9_input_handler*/ ctx[23]),
    				listen_dev(input10, "input", /*input10_input_handler*/ ctx[24]),
    				listen_dev(input11, "input", /*input11_input_handler*/ ctx[25])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newLQ*/ 1 && input0.value !== /*newLQ*/ ctx[0].rank) {
    				set_input_value(input0, /*newLQ*/ ctx[0].rank);
    			}

    			if (dirty & /*newLQ*/ 1 && input1.value !== /*newLQ*/ ctx[0].country) {
    				set_input_value(input1, /*newLQ*/ ctx[0].country);
    			}

    			if (dirty & /*newLQ*/ 1 && input2.value !== /*newLQ*/ ctx[0].stability) {
    				set_input_value(input2, /*newLQ*/ ctx[0].stability);
    			}

    			if (dirty & /*newLQ*/ 1 && input3.value !== /*newLQ*/ ctx[0].right) {
    				set_input_value(input3, /*newLQ*/ ctx[0].right);
    			}

    			if (dirty & /*newLQ*/ 1 && input4.value !== /*newLQ*/ ctx[0].health) {
    				set_input_value(input4, /*newLQ*/ ctx[0].health);
    			}

    			if (dirty & /*newLQ*/ 1 && input5.value !== /*newLQ*/ ctx[0].security) {
    				set_input_value(input5, /*newLQ*/ ctx[0].security);
    			}

    			if (dirty & /*newLQ*/ 1 && input6.value !== /*newLQ*/ ctx[0].climate) {
    				set_input_value(input6, /*newLQ*/ ctx[0].climate);
    			}

    			if (dirty & /*newLQ*/ 1 && input7.value !== /*newLQ*/ ctx[0].costs) {
    				set_input_value(input7, /*newLQ*/ ctx[0].costs);
    			}

    			if (dirty & /*newLQ*/ 1 && input8.value !== /*newLQ*/ ctx[0].popularity) {
    				set_input_value(input8, /*newLQ*/ ctx[0].popularity);
    			}

    			if (dirty & /*newLQ*/ 1 && input9.value !== /*newLQ*/ ctx[0].total) {
    				set_input_value(input9, /*newLQ*/ ctx[0].total);
    			}

    			if (dirty & /*newLQ*/ 1 && input10.value !== /*newLQ*/ ctx[0].year) {
    				set_input_value(input10, /*newLQ*/ ctx[0].year);
    			}

    			if (dirty & /*newLQ*/ 1 && input11.value !== /*newLQ*/ ctx[0].continent) {
    				set_input_value(input11, /*newLQ*/ ctx[0].continent);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*deleteLQ, lq*/ 36) {
    				each_value = /*lq*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(192:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (244:8) <Button color="primary" on:click="{getLQLoadInitialData}">
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reiniciar ejemplos iniciales");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(244:8) <Button color=\\\"primary\\\" on:click=\\\"{getLQLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (247:8) <Button color="danger" on:click="{deleteLQALL}">
    function create_default_slot_3$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(247:8) <Button color=\\\"danger\\\" on:click=\\\"{deleteLQALL}\\\">",
    		ctx
    	});

    	return block;
    }

    // (250:8) <Button outline color="success" on:click="{getPreviewPage}">
    function create_default_slot_2$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Atrás");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$7.name,
    		type: "slot",
    		source: "(250:8) <Button outline color=\\\"success\\\" on:click=\\\"{getPreviewPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (253:8) <Button outline color="success" on:click="{getNextPage}">
    function create_default_slot_1$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Siguiente");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(253:8) <Button outline color=\\\"success\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (188:15)           Loading lq...      {:then lq}
    function create_pending_block$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading lq...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$6.name,
    		type: "pending",
    		source: "(188:15)           Loading lq...      {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (257:4) {#if errorMSG}
    function create_if_block$9(ctx) {
    	let br;
    	let t0;
    	let p;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = space();
    			p = element("p");
    			t1 = text("STATUS: ");
    			t2 = text(/*errorMSG*/ ctx[1]);
    			add_location(br, file$b, 257, 4, 8746);
    			set_style(p, "color", "red");
    			add_location(p, file$b, 258, 4, 8756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMSG*/ 2) set_data_dev(t2, /*errorMSG*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(257:4) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (263:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(263:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let promise;
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$6,
    		then: create_then_block$6,
    		catch: create_catch_block$6,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*lq*/ ctx[2], info);
    	let if_block = /*errorMSG*/ ctx[1] && create_if_block$9(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "LQ Manager";
    			t1 = space();
    			info.block.c();
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			create_component(button.$$.fragment);
    			add_location(h1, file$b, 186, 4, 5589);
    			add_location(br0, file$b, 260, 4, 8817);
    			add_location(br1, file$b, 261, 4, 8827);
    			add_location(main, file$b, 185, 0, 5577);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t2;
    			append_dev(main, t2);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*lq*/ 4 && promise !== (promise = /*lq*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*errorMSG*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(main, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let page = 1;
    	let totaldata = 12;
    	let lq = [];

    	let newLQ = {
    		rank: "",
    		country: "",
    		stability: "",
    		right: "",
    		health: "",
    		security: "",
    		climate: "",
    		costs: "",
    		popularity: "",
    		total: "",
    		year: "",
    		continent: ""
    	};

    	let errorMSG = "";
    	onMount(getLQ);

    	//GET
    	async function getLQ() {
    		console.log("Fetching lq...");
    		const res = await fetch("api/v1/lq-stats?limit=10&offset=1");

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(2, lq = json);
    			console.log("Received " + lq.length + "lq.");
    		} else {
    			$$invalidate(1, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//GET INITIALDATA
    	async function getLQLoadInitialData() {
    		console.log("Fetching lq...");
    		await fetch("/api/v1/lq-stats/loadInitialData");
    		const res = await fetch("/api/v1/lq-stats/loadInitialData");

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(2, lq = json);
    			totaldata = lq.length;
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(1, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//INSERT
    	async function insertLQ() {
    		console.log("Inserting lq..." + JSON.stringify(newLQ));

    		const res = await fetch("/api/v1/lq-stats", {
    			method: "POST",
    			body: JSON.stringify(newLQ),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getLQ();
    			visible = true;

    			if (res.status == 200) {
    				totaldata++;
    				color = "success";
    				$$invalidate(1, errorMSG = newLQ.country + " creado correctamente");
    				console.log("Inserted" + newLQ.country + " lq.");
    			} else if (res.status == 400) {
    				color = "danger";
    				$$invalidate(1, errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.");
    				console.log("BAD REQUEST");
    			} else if (res.status == 409) {
    				color = "danger";
    				$$invalidate(1, errorMSG = newLQ.country + " " + newLQ.year + "  ya existe, recuerde que 'Year' y 'Country' son exclusivos.");
    				console.log("This data already exits");
    			} else {
    				color = "danger";
    				$$invalidate(1, errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.");
    			}
    		});
    	}

    	//DELETE SPECIFIC
    	async function deleteLQ(name, year) {
    		const res = await fetch("/api/v1/lq-stats/" + name + "/" + year, { method: "DELETE" }).then(function (res) {
    			visible = true;
    			getLQ();

    			if (res.status == 200) {
    				totaldata--;
    				color = "success";
    				$$invalidate(1, errorMSG = name + " " + year + " borrado correctamente");
    				console.log("Deleted " + name);
    			} else if (res.status == 404) {
    				color = "danger";
    				$$invalidate(1, errorMSG = "No se ha encontrado el objeto " + name);
    				console.log("LIFEQ NOT FOUND");
    			} else {
    				color = "danger";
    				$$invalidate(1, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deleteLQALL() {
    		const res = await fetch("/api/v1/lq-stats", { method: "DELETE" }).then(function (res) {
    			totaldata = 0;
    			$$invalidate(1, errorMSG = "");
    			getLQ();
    			console.log("Deleted all lq.");
    		});
    	}

    	//getNextPage
    	async function getNextPage() {
    		console.log(totaldata);

    		if (page + 10 > totaldata) {
    			page = 1;
    		} else {
    			page += 10;
    		}

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v1/lq-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(2, lq = json);
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(1, errorMSG = res.status + ":" + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//getPreviewPage
    	async function getPreviewPage() {
    		if (page - 10 >= 1) {
    			page -= 10;
    		} else page = 1;

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v1/lq-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(2, lq = json);
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(1, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	function input0_input_handler() {
    		newLQ.rank = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input1_input_handler() {
    		newLQ.country = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input2_input_handler() {
    		newLQ.stability = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input3_input_handler() {
    		newLQ.right = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input4_input_handler() {
    		newLQ.health = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input5_input_handler() {
    		newLQ.security = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input6_input_handler() {
    		newLQ.climate = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input7_input_handler() {
    		newLQ.costs = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input8_input_handler() {
    		newLQ.popularity = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input9_input_handler() {
    		newLQ.total = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input10_input_handler() {
    		newLQ.year = this.value;
    		$$invalidate(0, newLQ);
    	}

    	function input11_input_handler() {
    		newLQ.continent = this.value;
    		$$invalidate(0, newLQ);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Alert,
    		Table,
    		Button,
    		visible,
    		color,
    		page,
    		totaldata,
    		lq,
    		newLQ,
    		errorMSG,
    		getLQ,
    		getLQLoadInitialData,
    		insertLQ,
    		deleteLQ,
    		deleteLQALL,
    		getNextPage,
    		getPreviewPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("color" in $$props) color = $$props.color;
    		if ("page" in $$props) page = $$props.page;
    		if ("totaldata" in $$props) totaldata = $$props.totaldata;
    		if ("lq" in $$props) $$invalidate(2, lq = $$props.lq);
    		if ("newLQ" in $$props) $$invalidate(0, newLQ = $$props.newLQ);
    		if ("errorMSG" in $$props) $$invalidate(1, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newLQ,
    		errorMSG,
    		lq,
    		getLQLoadInitialData,
    		insertLQ,
    		deleteLQ,
    		deleteLQALL,
    		getNextPage,
    		getPreviewPage,
    		visible,
    		color,
    		page,
    		totaldata,
    		getLQ,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler
    	];
    }

    class Home$3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\front\App.svelte generated by Svelte v3.20.1 */
    const file$c = "src\\front\\App.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let current;

    	const router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file$c, 31, 0, 835);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const routes = {
    		"/": Home,
    		"/public/index.html": Home,
    		"/gui1spc": Home$1,
    		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
    		"/gui2poverty": Home$2,
    		"/poverty-stats/:country/:year": EditPoverty,
    		"/gui3lq": Home$3,
    		"/contact/:contactName": EditContact,
    		"*": NotFound
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		ContactsTable,
    		EditContact,
    		NotFound,
    		Home,
    		GUI1SPC: Home$1,
    		EditSpc,
    		GUI2POVERTY: Home$2,
    		EditPoverty,
    		GUI3LQ: Home$3,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector('#SvelteApp')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
