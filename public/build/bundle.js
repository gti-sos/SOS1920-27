
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
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.3' }, detail)));
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

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.22.3 */

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

    /* src\front\NotFound.svelte generated by Svelte v3.22.3 */

    const file = "src\\front\\NotFound.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "La página no existe!";
    			add_location(h1, file, 1, 4, 12);
    			add_location(main, file, 0, 0, 0);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$1.name
    		});
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

    /* node_modules\sveltestrap\src\Table.svelte generated by Svelte v3.22.3 */
    const file$1 = "node_modules\\sveltestrap\\src\\Table.svelte";

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
    			add_location(table, file$1, 38, 2, 908);
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
    			add_location(table, file$1, 33, 4, 826);
    			attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			add_location(div, file$1, 32, 2, 788);
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

    function create_fragment$2(ctx) {
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
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
    			id: create_fragment$2.name
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

    /* node_modules\sveltestrap\src\Button.svelte generated by Svelte v3.22.3 */
    const file$2 = "node_modules\\sveltestrap\\src\\Button.svelte";

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
    			add_location(button, file$2, 53, 2, 1061);
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
    			add_location(a, file$2, 37, 2, 825);
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
    			add_location(span, file$2, 64, 8, 1250);
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
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(63:10)        ",
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

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$3($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
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
    			id: create_fragment$3.name
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

    /* src\front\Home.svelte generated by Svelte v3.22.3 */
    const file$3 = "src\\front\\Home.svelte";

    // (15:0) <Button outline color="secondary">
    function create_default_slot_3(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI spc";
    			attr_dev(a, "href", "#/gui1SPC");
    			add_location(a, file$3, 14, 34, 303);
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
    function create_default_slot_2(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI poverty";
    			attr_dev(a, "href", "#/gui2poverty");
    			add_location(a, file$3, 15, 34, 380);
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(16:0) <Button outline color=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Button outline color="secondary">
    function create_default_slot_1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "GUI lq";
    			attr_dev(a, "href", "#/gui3lq");
    			add_location(a, file$3, 16, 34, 465);
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(17:0) <Button outline color=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:0) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:0) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
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
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button2 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot] },
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
    			add_location(br0, file$3, 13, 1, 263);
    			add_location(br1, file$3, 18, 0, 508);
    			add_location(br2, file$3, 19, 0, 514);
    			add_location(main, file$3, 12, 1, 254);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
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
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules\sveltestrap\src\Alert.svelte generated by Svelte v3.22.3 */
    const file$4 = "node_modules\\sveltestrap\\src\\Alert.svelte";

    // (25:0) {#if isOpen}
    function create_if_block$3(ctx) {
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
    			add_location(div, file$4, 25, 2, 684);
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
    		id: create_if_block$3.name,
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
    			add_location(span, file$4, 36, 8, 941);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", /*closeClassNames*/ ctx[6]);
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$4, 31, 6, 808);
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

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[2] && create_if_block$3(ctx);

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

    					if (dirty & /*isOpen*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
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
    			id: create_fragment$5.name
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

    /* node_modules\sveltestrap\src\Card.svelte generated by Svelte v3.22.3 */
    const file$5 = "node_modules\\sveltestrap\\src\\Card.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let div_levels = [
    		/*props*/ ctx[3],
    		{ id: /*id*/ ctx[0] },
    		{ class: /*classes*/ ctx[2] },
    		{ style: /*style*/ ctx[1] }
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 24, 0, 512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*click_handler*/ ctx[12], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[10], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 4 && { class: /*classes*/ ctx[2] },
    				dirty & /*style*/ 2 && { style: /*style*/ ctx[1] }
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
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
    	let { class: className = "" } = $$props;
    	let { body = false } = $$props;
    	let { color = "" } = $$props;
    	let { id = "" } = $$props;
    	let { inverse = false } = $$props;
    	let { outline = false } = $$props;
    	let { style = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("body" in $$new_props) $$invalidate(5, body = $$new_props.body);
    		if ("color" in $$new_props) $$invalidate(6, color = $$new_props.color);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("inverse" in $$new_props) $$invalidate(7, inverse = $$new_props.inverse);
    		if ("outline" in $$new_props) $$invalidate(8, outline = $$new_props.outline);
    		if ("style" in $$new_props) $$invalidate(1, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		body,
    		color,
    		id,
    		inverse,
    		outline,
    		style,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("body" in $$props) $$invalidate(5, body = $$new_props.body);
    		if ("color" in $$props) $$invalidate(6, color = $$new_props.color);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("inverse" in $$props) $$invalidate(7, inverse = $$new_props.inverse);
    		if ("outline" in $$props) $$invalidate(8, outline = $$new_props.outline);
    		if ("style" in $$props) $$invalidate(1, style = $$new_props.style);
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, inverse, body, color, outline*/ 496) {
    			 $$invalidate(2, classes = clsx(className, "card", inverse ? "text-white" : false, body ? "card-body" : false, color ? `${outline ? "border" : "bg"}-${color}` : false));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		id,
    		style,
    		classes,
    		props,
    		className,
    		body,
    		color,
    		inverse,
    		outline,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 4,
    			body: 5,
    			color: 6,
    			id: 0,
    			inverse: 7,
    			outline: 8,
    			style: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\CardBody.svelte generated by Svelte v3.22.3 */
    const file$6 = "node_modules\\sveltestrap\\src\\CardBody.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let div_levels = [/*props*/ ctx[2], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[1] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 13, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 4 && /*props*/ ctx[2],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	let { id = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardBody", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		id,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 8) {
    			 $$invalidate(1, classes = clsx(className, "card-body"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [id, classes, props, className, $$props, $$scope, $$slots];
    }

    class CardBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { class: 3, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardBody",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<CardBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<CardBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<CardBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Collapse.svelte generated by Svelte v3.22.3 */
    const file$7 = "node_modules\\sveltestrap\\src\\Collapse.svelte";

    // (60:0) {#if isOpen}
    function create_if_block$4(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);
    	let div_levels = [{ class: /*classes*/ ctx[6] }, /*props*/ ctx[7]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$7, 60, 2, 1284);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div, "introstart", /*introstart_handler*/ ctx[19], false, false, false),
    				listen_dev(div, "introend", /*introend_handler*/ ctx[20], false, false, false),
    				listen_dev(div, "outrostart", /*outrostart_handler*/ ctx[21], false, false, false),
    				listen_dev(div, "outroend", /*outroend_handler*/ ctx[22], false, false, false),
    				listen_dev(
    					div,
    					"introstart",
    					function () {
    						if (is_function(/*onEntering*/ ctx[1])) /*onEntering*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					div,
    					"introend",
    					function () {
    						if (is_function(/*onEntered*/ ctx[2])) /*onEntered*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					div,
    					"outrostart",
    					function () {
    						if (is_function(/*onExiting*/ ctx[3])) /*onExiting*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					div,
    					"outroend",
    					function () {
    						if (is_function(/*onExited*/ ctx[4])) /*onExited*/ ctx[4].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[17], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*classes*/ 64 && { class: /*classes*/ ctx[6] },
    				dirty & /*props*/ 128 && /*props*/ ctx[7]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(60:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[23]);
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[23]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
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
    			dispose();
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
    	const noop = () => undefined;
    	let { isOpen = false } = $$props;
    	let { class: className = "" } = $$props;
    	let { navbar = false } = $$props;
    	let { onEntering = noop } = $$props;
    	let { onEntered = noop } = $$props;
    	let { onExiting = noop } = $$props;
    	let { onExited = noop } = $$props;
    	let { expand = false } = $$props;
    	const props = clean($$props);
    	let windowWidth = 0;
    	let _wasMaximazed = false;
    	const minWidth = {};
    	minWidth["xs"] = 0;
    	minWidth["sm"] = 576;
    	minWidth["md"] = 768;
    	minWidth["lg"] = 992;
    	minWidth["xl"] = 1200;
    	const dispatch = createEventDispatcher();

    	function notify() {
    		dispatch("update", { isOpen });
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Collapse", $$slots, ['default']);

    	function introstart_handler(event) {
    		bubble($$self, event);
    	}

    	function introend_handler(event) {
    		bubble($$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble($$self, event);
    	}

    	function outroend_handler(event) {
    		bubble($$self, event);
    	}

    	function onwindowresize() {
    		$$invalidate(5, windowWidth = window.innerWidth);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("isOpen" in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ("class" in $$new_props) $$invalidate(8, className = $$new_props.class);
    		if ("navbar" in $$new_props) $$invalidate(9, navbar = $$new_props.navbar);
    		if ("onEntering" in $$new_props) $$invalidate(1, onEntering = $$new_props.onEntering);
    		if ("onEntered" in $$new_props) $$invalidate(2, onEntered = $$new_props.onEntered);
    		if ("onExiting" in $$new_props) $$invalidate(3, onExiting = $$new_props.onExiting);
    		if ("onExited" in $$new_props) $$invalidate(4, onExited = $$new_props.onExited);
    		if ("expand" in $$new_props) $$invalidate(10, expand = $$new_props.expand);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		createEventDispatcher,
    		slide,
    		noop,
    		isOpen,
    		className,
    		navbar,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		expand,
    		props,
    		windowWidth,
    		_wasMaximazed,
    		minWidth,
    		dispatch,
    		notify,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), $$new_props));
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ("className" in $$props) $$invalidate(8, className = $$new_props.className);
    		if ("navbar" in $$props) $$invalidate(9, navbar = $$new_props.navbar);
    		if ("onEntering" in $$props) $$invalidate(1, onEntering = $$new_props.onEntering);
    		if ("onEntered" in $$props) $$invalidate(2, onEntered = $$new_props.onEntered);
    		if ("onExiting" in $$props) $$invalidate(3, onExiting = $$new_props.onExiting);
    		if ("onExited" in $$props) $$invalidate(4, onExited = $$new_props.onExited);
    		if ("expand" in $$props) $$invalidate(10, expand = $$new_props.expand);
    		if ("windowWidth" in $$props) $$invalidate(5, windowWidth = $$new_props.windowWidth);
    		if ("_wasMaximazed" in $$props) $$invalidate(11, _wasMaximazed = $$new_props._wasMaximazed);
    		if ("classes" in $$props) $$invalidate(6, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, navbar*/ 768) {
    			 $$invalidate(6, classes = clsx(className, // collapseClass,
    			navbar && "navbar-collapse"));
    		}

    		if ($$self.$$.dirty & /*navbar, expand, windowWidth, minWidth, isOpen, _wasMaximazed*/ 7713) {
    			 if (navbar && expand) {
    				if (windowWidth >= minWidth[expand] && !isOpen) {
    					$$invalidate(0, isOpen = true);
    					$$invalidate(11, _wasMaximazed = true);
    					notify();
    				} else if (windowWidth < minWidth[expand] && _wasMaximazed) {
    					$$invalidate(0, isOpen = false);
    					$$invalidate(11, _wasMaximazed = false);
    					notify();
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		isOpen,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		windowWidth,
    		classes,
    		props,
    		className,
    		navbar,
    		expand,
    		_wasMaximazed,
    		minWidth,
    		noop,
    		dispatch,
    		notify,
    		$$props,
    		$$scope,
    		$$slots,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		onwindowresize
    	];
    }

    class Collapse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			isOpen: 0,
    			class: 8,
    			navbar: 9,
    			onEntering: 1,
    			onEntered: 2,
    			onExiting: 3,
    			onExited: 4,
    			expand: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapse",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navbar() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navbar(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntering() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntering(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntered() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntered(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExiting() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExiting(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExited() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExited(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expand() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expand(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\UncontrolledCollapse.svelte generated by Svelte v3.22.3 */

    const { Error: Error_1$1 } = globals;

    // (69:0) <Collapse   {...props}   {isOpen}   on:introstart   on:introend   on:outrostart   on:outroend   on:introstart={onEntering}   on:introend={onEntered}   on:outrostart={onExiting}   on:outroend={onExited}   class={className}>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

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
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[19], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null));
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(69:0) <Collapse   {...props}   {isOpen}   on:introstart   on:introend   on:outrostart   on:outroend   on:introstart={onEntering}   on:introend={onEntered}   on:outrostart={onExiting}   on:outroend={onExited}   class={className}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current;

    	const collapse_spread_levels = [
    		/*props*/ ctx[6],
    		{ isOpen: /*isOpen*/ ctx[5] },
    		{ class: /*className*/ ctx[0] }
    	];

    	let collapse_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < collapse_spread_levels.length; i += 1) {
    		collapse_props = assign(collapse_props, collapse_spread_levels[i]);
    	}

    	const collapse = new Collapse({ props: collapse_props, $$inline: true });
    	collapse.$on("introstart", /*introstart_handler*/ ctx[15]);
    	collapse.$on("introend", /*introend_handler*/ ctx[16]);
    	collapse.$on("outrostart", /*outrostart_handler*/ ctx[17]);
    	collapse.$on("outroend", /*outroend_handler*/ ctx[18]);

    	collapse.$on("introstart", function () {
    		if (is_function(/*onEntering*/ ctx[1])) /*onEntering*/ ctx[1].apply(this, arguments);
    	});

    	collapse.$on("introend", function () {
    		if (is_function(/*onEntered*/ ctx[2])) /*onEntered*/ ctx[2].apply(this, arguments);
    	});

    	collapse.$on("outrostart", function () {
    		if (is_function(/*onExiting*/ ctx[3])) /*onExiting*/ ctx[3].apply(this, arguments);
    	});

    	collapse.$on("outroend", function () {
    		if (is_function(/*onExited*/ ctx[4])) /*onExited*/ ctx[4].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(collapse.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(collapse, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			const collapse_changes = (dirty & /*props, isOpen, className*/ 97)
    			? get_spread_update(collapse_spread_levels, [
    					dirty & /*props*/ 64 && get_spread_object(/*props*/ ctx[6]),
    					dirty & /*isOpen*/ 32 && { isOpen: /*isOpen*/ ctx[5] },
    					dirty & /*className*/ 1 && { class: /*className*/ ctx[0] }
    				])
    			: {};

    			if (dirty & /*$$scope*/ 524288) {
    				collapse_changes.$$scope = { dirty, ctx };
    			}

    			collapse.$set(collapse_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collapse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collapse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(collapse, detaching);
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
    	const noop = () => undefined;
    	let { class: className = "" } = $$props;
    	let { defaultOpen = false } = $$props;
    	let { toggler } = $$props;
    	let { onEntering = noop } = $$props;
    	let { onEntered = noop } = $$props;
    	let { onExiting = noop } = $$props;
    	let { onExited = noop } = $$props;
    	const props = clean($$props);
    	let unbindEvents;
    	let isOpen = defaultOpen;

    	function togglerFn() {
    		$$invalidate(5, isOpen = !isOpen);
    	}

    	const defaultToggleEvents = ["touchstart", "click"];

    	onMount(() => {
    		if (typeof toggler === "string" && typeof window !== "undefined" && document && document.createElement) {
    			let selection = document.querySelectorAll(toggler);

    			if (!selection.length) {
    				selection = document.querySelectorAll(`#${toggler}`);
    			}

    			if (!selection.length) {
    				throw new Error(`The target '${toggler}' could not be identified in the dom, tip: check spelling`);
    			}

    			defaultToggleEvents.forEach(event => {
    				selection.forEach(element => {
    					element.addEventListener(event, togglerFn);
    				});
    			});

    			unbindEvents = () => {
    				defaultToggleEvents.forEach(event => {
    					selection.forEach(element => {
    						element.removeEventListener(event, togglerFn);
    					});
    				});
    			};
    		}
    	});

    	onDestroy(() => {
    		if (typeof unbindEvents === "function") {
    			unbindEvents();
    			unbindEvents = undefined;
    		}
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UncontrolledCollapse", $$slots, ['default']);

    	function introstart_handler(event) {
    		bubble($$self, event);
    	}

    	function introend_handler(event) {
    		bubble($$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble($$self, event);
    	}

    	function outroend_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("defaultOpen" in $$new_props) $$invalidate(7, defaultOpen = $$new_props.defaultOpen);
    		if ("toggler" in $$new_props) $$invalidate(8, toggler = $$new_props.toggler);
    		if ("onEntering" in $$new_props) $$invalidate(1, onEntering = $$new_props.onEntering);
    		if ("onEntered" in $$new_props) $$invalidate(2, onEntered = $$new_props.onEntered);
    		if ("onExiting" in $$new_props) $$invalidate(3, onExiting = $$new_props.onExiting);
    		if ("onExited" in $$new_props) $$invalidate(4, onExited = $$new_props.onExited);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		onMount,
    		onDestroy,
    		Collapse,
    		noop,
    		className,
    		defaultOpen,
    		toggler,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		props,
    		unbindEvents,
    		isOpen,
    		togglerFn,
    		defaultToggleEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("defaultOpen" in $$props) $$invalidate(7, defaultOpen = $$new_props.defaultOpen);
    		if ("toggler" in $$props) $$invalidate(8, toggler = $$new_props.toggler);
    		if ("onEntering" in $$props) $$invalidate(1, onEntering = $$new_props.onEntering);
    		if ("onEntered" in $$props) $$invalidate(2, onEntered = $$new_props.onEntered);
    		if ("onExiting" in $$props) $$invalidate(3, onExiting = $$new_props.onExiting);
    		if ("onExited" in $$props) $$invalidate(4, onExited = $$new_props.onExited);
    		if ("unbindEvents" in $$props) unbindEvents = $$new_props.unbindEvents;
    		if ("isOpen" in $$props) $$invalidate(5, isOpen = $$new_props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		isOpen,
    		props,
    		defaultOpen,
    		toggler,
    		unbindEvents,
    		noop,
    		togglerFn,
    		defaultToggleEvents,
    		$$props,
    		$$slots,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		$$scope
    	];
    }

    class UncontrolledCollapse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 0,
    			defaultOpen: 7,
    			toggler: 8,
    			onEntering: 1,
    			onEntered: 2,
    			onExiting: 3,
    			onExited: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UncontrolledCollapse",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggler*/ ctx[8] === undefined && !("toggler" in props)) {
    			console.warn("<UncontrolledCollapse> was created without expected prop 'toggler'");
    		}
    	}

    	get class() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultOpen() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultOpen(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggler() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggler(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntering() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntering(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntered() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntered(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExiting() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExiting(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExited() {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExited(value) {
    		throw new Error_1$1("<UncontrolledCollapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI1SPC\Home.svelte generated by Svelte v3.22.3 */

    const { console: console_1$1 } = globals;

    const file$8 = "src\\front\\GUI1SPC\\Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    // (278:6) <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar spc");
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
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(278:6) <Button color=\\\"primary\\\" on:click={() => (isOpen = !isOpen)} class=\\\"mb-3\\\">",
    		ctx
    	});

    	return block;
    }

    // (295:25) <Button outline  color="primary" on:click={searchSPC}>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
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
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(295:25) <Button outline  color=\\\"primary\\\" on:click={searchSPC}>",
    		ctx
    	});

    	return block;
    }

    // (283:8) <Table bordered responsive>
    function create_default_slot_9(ctx) {
    	let tbody;
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let td2;
    	let input2;
    	let t2;
    	let td3;
    	let input3;
    	let t3;
    	let td4;
    	let input4;
    	let t4;
    	let td5;
    	let input5;
    	let t5;
    	let td6;
    	let input6;
    	let t6;
    	let td7;
    	let input7;
    	let t7;
    	let td8;
    	let input8;
    	let t8;
    	let td9;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*searchSPC*/ ctx[11]);

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t2 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t3 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t4 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t5 = space();
    			td6 = element("td");
    			input6 = element("input");
    			t6 = space();
    			td7 = element("td");
    			input7 = element("input");
    			t7 = space();
    			td8 = element("td");
    			input8 = element("input");
    			t8 = space();
    			td9 = element("td");
    			create_component(button.$$.fragment);
    			attr_dev(input0, "placeholder", "País");
    			add_location(input0, file$8, 285, 24, 8965);
    			add_location(td0, file$8, 285, 20, 8961);
    			attr_dev(input1, "placeholder", "Ambos sexos");
    			add_location(input1, file$8, 286, 24, 9055);
    			add_location(td1, file$8, 286, 20, 9051);
    			attr_dev(input2, "placeholder", "Ranking hombres");
    			add_location(input2, file$8, 287, 24, 9153);
    			add_location(td2, file$8, 287, 20, 9149);
    			attr_dev(input3, "placeholder", "Número hombres (en miles)");
    			add_location(input3, file$8, 288, 24, 9256);
    			add_location(td3, file$8, 288, 20, 9252);
    			attr_dev(input4, "placeholder", "Ranking mujeres");
    			add_location(input4, file$8, 289, 24, 9371);
    			add_location(td4, file$8, 289, 20, 9367);
    			attr_dev(input5, "placeholder", "Número mujeres (en miles)");
    			add_location(input5, file$8, 290, 24, 9476);
    			add_location(td5, file$8, 290, 20, 9472);
    			attr_dev(input6, "placeholder", "Ratio");
    			add_location(input6, file$8, 291, 24, 9593);
    			add_location(td6, file$8, 291, 20, 9589);
    			attr_dev(input7, "placeholder", "Año");
    			add_location(input7, file$8, 292, 24, 9682);
    			add_location(td7, file$8, 292, 20, 9678);
    			attr_dev(input8, "placeholder", "Continente");
    			add_location(input8, file$8, 293, 24, 9768);
    			add_location(td8, file$8, 293, 20, 9764);
    			add_location(td9, file$8, 294, 20, 9862);
    			add_location(tr, file$8, 284, 16, 8935);
    			add_location(tbody, file$8, 283, 12, 8910);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*searchSpc*/ ctx[4].country);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*searchSpc*/ ctx[4].both_sex);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*searchSpc*/ ctx[4].male_rank);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*searchSpc*/ ctx[4].male_number);
    			append_dev(tr, t3);
    			append_dev(tr, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*searchSpc*/ ctx[4].female_rank);
    			append_dev(tr, t4);
    			append_dev(tr, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*searchSpc*/ ctx[4].female_number);
    			append_dev(tr, t5);
    			append_dev(tr, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*searchSpc*/ ctx[4].ratio);
    			append_dev(tr, t6);
    			append_dev(tr, td7);
    			append_dev(td7, input7);
    			set_input_value(input7, /*searchSpc*/ ctx[4].year);
    			append_dev(tr, t7);
    			append_dev(tr, td8);
    			append_dev(td8, input8);
    			set_input_value(input8, /*searchSpc*/ ctx[4].continent);
    			append_dev(tr, t8);
    			append_dev(tr, td9);
    			mount_component(button, td9, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[20]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[21]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[22]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[23]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[24]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[25]),
    				listen_dev(input7, "input", /*input7_input_handler*/ ctx[26]),
    				listen_dev(input8, "input", /*input8_input_handler*/ ctx[27])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchSpc*/ 16 && input0.value !== /*searchSpc*/ ctx[4].country) {
    				set_input_value(input0, /*searchSpc*/ ctx[4].country);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input1.value !== /*searchSpc*/ ctx[4].both_sex) {
    				set_input_value(input1, /*searchSpc*/ ctx[4].both_sex);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input2.value !== /*searchSpc*/ ctx[4].male_rank) {
    				set_input_value(input2, /*searchSpc*/ ctx[4].male_rank);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input3.value !== /*searchSpc*/ ctx[4].male_number) {
    				set_input_value(input3, /*searchSpc*/ ctx[4].male_number);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input4.value !== /*searchSpc*/ ctx[4].female_rank) {
    				set_input_value(input4, /*searchSpc*/ ctx[4].female_rank);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input5.value !== /*searchSpc*/ ctx[4].female_number) {
    				set_input_value(input5, /*searchSpc*/ ctx[4].female_number);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input6.value !== /*searchSpc*/ ctx[4].ratio) {
    				set_input_value(input6, /*searchSpc*/ ctx[4].ratio);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input7.value !== /*searchSpc*/ ctx[4].year) {
    				set_input_value(input7, /*searchSpc*/ ctx[4].year);
    			}

    			if (dirty[0] & /*searchSpc*/ 16 && input8.value !== /*searchSpc*/ ctx[4].continent) {
    				set_input_value(input8, /*searchSpc*/ ctx[4].continent);
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
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
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(283:8) <Table bordered responsive>",
    		ctx
    	});

    	return block;
    }

    // (282:6) <Collapse {isOpen}>
    function create_default_slot_8(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				responsive: true,
    				$$slots: { default: [create_default_slot_9] },
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

    			if (dirty[0] & /*searchSpc*/ 16 | dirty[1] & /*$$scope*/ 1024) {
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
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(282:6) <Collapse {isOpen}>",
    		ctx
    	});

    	return block;
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

    // (303:4) {:then spc}
    function create_then_block(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[2],
    				isOpen: /*visible*/ ctx[1],
    				toggle: /*func*/ ctx[28],
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				bordered: true,
    				responsive: true,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				color: "success",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getSPCLoadInitialData*/ ctx[7]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteSPCALL*/ ctx[10]);

    	const button2 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*getPreviewPage*/ ctx[13]);

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*getNextPage*/ ctx[12]);

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
    			if (dirty[0] & /*color*/ 4) alert_changes.color = /*color*/ ctx[2];
    			if (dirty[0] & /*visible*/ 2) alert_changes.isOpen = /*visible*/ ctx[1];
    			if (dirty[0] & /*visible*/ 2) alert_changes.toggle = /*func*/ ctx[28];

    			if (dirty[0] & /*errorMSG*/ 32 | dirty[1] & /*$$scope*/ 1024) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty[0] & /*spc, newSpc*/ 72 | dirty[1] & /*$$scope*/ 1024) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
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
    		id: create_then_block.name,
    		type: "then",
    		source: "(303:4) {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (305:8) {#if errorMSG}
    function create_if_block$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*errorMSG*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMSG*/ 32) set_data_dev(t, /*errorMSG*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(305:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (304:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_7(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[5] && create_if_block$5(ctx);

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
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(304:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (335:25) <Button outline  color="primary" on:click={insertSPC}>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insertar");
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
    		source: "(335:25) <Button outline  color=\\\"primary\\\" on:click={insertSPC}>",
    		ctx
    	});

    	return block;
    }

    // (349:28) <Button outline color="danger" on:click="{deleteSPC(suicide.country, suicide.year)}">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
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
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(349:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteSPC(suicide.country, suicide.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (338:16) {#each spc as suicide}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*suicide*/ ctx[38].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*suicide*/ ctx[38].both_sex + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*suicide*/ ctx[38].male_rank + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*suicide*/ ctx[38].male_number + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*suicide*/ ctx[38].female_rank + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*suicide*/ ctx[38].female_number + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*suicide*/ ctx[38].ratio + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*suicide*/ ctx[38].year + "";
    	let t14;
    	let t15;
    	let td8;
    	let t16_value = /*suicide*/ ctx[38].continent + "";
    	let t16;
    	let t17;
    	let td9;
    	let t18;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*deleteSPC*/ ctx[9](/*suicide*/ ctx[38].country, /*suicide*/ ctx[38].year))) /*deleteSPC*/ ctx[9](/*suicide*/ ctx[38].country, /*suicide*/ ctx[38].year).apply(this, arguments);
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
    			attr_dev(a, "href", a_href_value = "#/spc-stats/" + /*suicide*/ ctx[38].country + "/" + /*suicide*/ ctx[38].year);
    			add_location(a, file$8, 339, 28, 11655);
    			add_location(td0, file$8, 339, 24, 11651);
    			add_location(td1, file$8, 340, 24, 11762);
    			add_location(td2, file$8, 341, 24, 11815);
    			add_location(td3, file$8, 342, 24, 11869);
    			add_location(td4, file$8, 343, 24, 11925);
    			add_location(td5, file$8, 344, 24, 11981);
    			add_location(td6, file$8, 345, 24, 12039);
    			add_location(td7, file$8, 346, 24, 12089);
    			add_location(td8, file$8, 347, 24, 12138);
    			add_location(td9, file$8, 348, 24, 12192);
    			add_location(tr, file$8, 338, 20, 11621);
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
    			if ((!current || dirty[0] & /*spc*/ 64) && t0_value !== (t0_value = /*suicide*/ ctx[38].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*spc*/ 64 && a_href_value !== (a_href_value = "#/spc-stats/" + /*suicide*/ ctx[38].country + "/" + /*suicide*/ ctx[38].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty[0] & /*spc*/ 64) && t2_value !== (t2_value = /*suicide*/ ctx[38].both_sex + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t4_value !== (t4_value = /*suicide*/ ctx[38].male_rank + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t6_value !== (t6_value = /*suicide*/ ctx[38].male_number + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t8_value !== (t8_value = /*suicide*/ ctx[38].female_rank + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t10_value !== (t10_value = /*suicide*/ ctx[38].female_number + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t12_value !== (t12_value = /*suicide*/ ctx[38].ratio + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t14_value !== (t14_value = /*suicide*/ ctx[38].year + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty[0] & /*spc*/ 64) && t16_value !== (t16_value = /*suicide*/ ctx[38].continent + "")) set_data_dev(t16, t16_value);
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
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
    		source: "(338:16) {#each spc as suicide}",
    		ctx
    	});

    	return block;
    }

    // (309:8) <Table bordered responsive>
    function create_default_slot_4(ctx) {
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
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertSPC*/ ctx[8]);
    	let each_value = /*spc*/ ctx[6];
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

    			add_location(th0, file$8, 311, 20, 10343);
    			add_location(th1, file$8, 312, 20, 10381);
    			add_location(th2, file$8, 313, 20, 10420);
    			add_location(th3, file$8, 314, 20, 10460);
    			add_location(th4, file$8, 315, 20, 10502);
    			add_location(th5, file$8, 316, 20, 10544);
    			add_location(th6, file$8, 317, 20, 10588);
    			add_location(th7, file$8, 318, 20, 10624);
    			add_location(th8, file$8, 319, 20, 10659);
    			add_location(th9, file$8, 320, 20, 10699);
    			add_location(tr0, file$8, 310, 16, 10317);
    			add_location(thead, file$8, 309, 12, 10292);
    			add_location(input0, file$8, 325, 24, 10829);
    			add_location(td0, file$8, 325, 20, 10825);
    			add_location(input1, file$8, 326, 24, 10897);
    			add_location(td1, file$8, 326, 20, 10893);
    			add_location(input2, file$8, 327, 24, 10966);
    			add_location(td2, file$8, 327, 20, 10962);
    			add_location(input3, file$8, 328, 24, 11036);
    			add_location(td3, file$8, 328, 20, 11032);
    			add_location(input4, file$8, 329, 24, 11108);
    			add_location(td4, file$8, 329, 20, 11104);
    			add_location(input5, file$8, 330, 24, 11180);
    			add_location(td5, file$8, 330, 20, 11176);
    			add_location(input6, file$8, 331, 24, 11254);
    			add_location(td6, file$8, 331, 20, 11250);
    			add_location(input7, file$8, 332, 24, 11320);
    			add_location(td7, file$8, 332, 20, 11316);
    			add_location(input8, file$8, 333, 24, 11385);
    			add_location(td8, file$8, 333, 20, 11381);
    			add_location(td9, file$8, 334, 20, 11451);
    			add_location(tr1, file$8, 324, 16, 10799);
    			add_location(tbody, file$8, 323, 12, 10774);
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
    			set_input_value(input0, /*newSpc*/ ctx[3].country);
    			append_dev(tr1, t20);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newSpc*/ ctx[3].both_sex);
    			append_dev(tr1, t21);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newSpc*/ ctx[3].male_rank);
    			append_dev(tr1, t22);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newSpc*/ ctx[3].male_number);
    			append_dev(tr1, t23);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newSpc*/ ctx[3].female_rank);
    			append_dev(tr1, t24);
    			append_dev(tr1, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newSpc*/ ctx[3].female_number);
    			append_dev(tr1, t25);
    			append_dev(tr1, td6);
    			append_dev(td6, input6);
    			set_input_value(input6, /*newSpc*/ ctx[3].ratio);
    			append_dev(tr1, t26);
    			append_dev(tr1, td7);
    			append_dev(td7, input7);
    			set_input_value(input7, /*newSpc*/ ctx[3].year);
    			append_dev(tr1, t27);
    			append_dev(tr1, td8);
    			append_dev(td8, input8);
    			set_input_value(input8, /*newSpc*/ ctx[3].continent);
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
    				listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[29]),
    				listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[30]),
    				listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[31]),
    				listen_dev(input3, "input", /*input3_input_handler_1*/ ctx[32]),
    				listen_dev(input4, "input", /*input4_input_handler_1*/ ctx[33]),
    				listen_dev(input5, "input", /*input5_input_handler_1*/ ctx[34]),
    				listen_dev(input6, "input", /*input6_input_handler_1*/ ctx[35]),
    				listen_dev(input7, "input", /*input7_input_handler_1*/ ctx[36]),
    				listen_dev(input8, "input", /*input8_input_handler_1*/ ctx[37])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newSpc*/ 8 && input0.value !== /*newSpc*/ ctx[3].country) {
    				set_input_value(input0, /*newSpc*/ ctx[3].country);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input1.value !== /*newSpc*/ ctx[3].both_sex) {
    				set_input_value(input1, /*newSpc*/ ctx[3].both_sex);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input2.value !== /*newSpc*/ ctx[3].male_rank) {
    				set_input_value(input2, /*newSpc*/ ctx[3].male_rank);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input3.value !== /*newSpc*/ ctx[3].male_number) {
    				set_input_value(input3, /*newSpc*/ ctx[3].male_number);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input4.value !== /*newSpc*/ ctx[3].female_rank) {
    				set_input_value(input4, /*newSpc*/ ctx[3].female_rank);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input5.value !== /*newSpc*/ ctx[3].female_number) {
    				set_input_value(input5, /*newSpc*/ ctx[3].female_number);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input6.value !== /*newSpc*/ ctx[3].ratio) {
    				set_input_value(input6, /*newSpc*/ ctx[3].ratio);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input7.value !== /*newSpc*/ ctx[3].year) {
    				set_input_value(input7, /*newSpc*/ ctx[3].year);
    			}

    			if (dirty[0] & /*newSpc*/ 8 && input8.value !== /*newSpc*/ ctx[3].continent) {
    				set_input_value(input8, /*newSpc*/ ctx[3].continent);
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty[0] & /*deleteSPC, spc*/ 576) {
    				each_value = /*spc*/ ctx[6];
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
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(309:8) <Table bordered responsive>",
    		ctx
    	});

    	return block;
    }

    // (354:10) <Button color="success" on:click="{getSPCLoadInitialData}">
    function create_default_slot_3$1(ctx) {
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
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(354:10) <Button color=\\\"success\\\" on:click=\\\"{getSPCLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (357:8) <Button color="danger" on:click="{deleteSPCALL}">
    function create_default_slot_2$1(ctx) {
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
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(357:8) <Button color=\\\"danger\\\" on:click=\\\"{deleteSPCALL}\\\">",
    		ctx
    	});

    	return block;
    }

    // (360:8) <Button outline color="primary" on:click="{getPreviewPage}">
    function create_default_slot_1$1(ctx) {
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(360:8) <Button outline color=\\\"primary\\\" on:click=\\\"{getPreviewPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (363:8) <Button outline color="primary" on:click="{getNextPage}">
    function create_default_slot$2(ctx) {
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(363:8) <Button outline color=\\\"primary\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (301:18)           Loading spc...      {:then spc}
    function create_pending_block(ctx) {
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
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(301:18)           Loading spc...      {:then spc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let script0;
    	let script0_src_value;
    	let t0;
    	let script1;
    	let script1_src_value;
    	let t1;
    	let h1;
    	let t3;
    	let t4;
    	let t5;
    	let promise;
    	let current;

    	const button = new Button({
    			props: {
    				color: "primary",
    				class: "mb-3",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[18]);

    	const collapse = new Collapse({
    			props: {
    				isOpen: /*isOpen*/ ctx[0],
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*spc*/ ctx[6], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			script0 = element("script");
    			t0 = space();
    			script1 = element("script");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "SPC Manager";
    			t3 = space();
    			create_component(button.$$.fragment);
    			t4 = space();
    			create_component(collapse.$$.fragment);
    			t5 = space();
    			info.block.c();
    			if (script0.src !== (script0_src_value = "https://cdn.jsdelivr.net/npm/apexcharts")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$8, 272, 4, 8543);
    			if (script1.src !== (script1_src_value = "apex.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$8, 273, 4, 8641);
    			add_location(h1, file$8, 274, 4, 8678);
    			add_location(main, file$8, 271, 0, 8531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, script0);
    			append_dev(main, t0);
    			append_dev(main, script1);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			mount_component(button, main, null);
    			append_dev(main, t4);
    			mount_component(collapse, main, null);
    			append_dev(main, t5);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const collapse_changes = {};
    			if (dirty[0] & /*isOpen*/ 1) collapse_changes.isOpen = /*isOpen*/ ctx[0];

    			if (dirty[0] & /*searchSpc*/ 16 | dirty[1] & /*$$scope*/ 1024) {
    				collapse_changes.$$scope = { dirty, ctx };
    			}

    			collapse.$set(collapse_changes);
    			info.ctx = ctx;

    			if (dirty[0] & /*spc*/ 64 && promise !== (promise = /*spc*/ ctx[6]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(collapse.$$.fragment, local);
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(collapse.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    			destroy_component(collapse);
    			info.block.d();
    			info.token = null;
    			info = null;
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
    	let isOpen = false;
    	let busquedas = "/api/v2/spc-stats?";

    	//ALERTAS
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

    	let searchSpc = {
    		country: null,
    		both_sex: null,
    		male_rank: null,
    		male_number: null,
    		female_rank: null,
    		female_number: null,
    		ratio: null,
    		year: null,
    		continent: null
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
    			$$invalidate(6, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
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
    			$$invalidate(6, spc = json);
    			totaldata = 12;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
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
    			$$invalidate(1, visible = true);

    			if (res.status == 200) {
    				totaldata++;
    				$$invalidate(2, color = "success");
    				$$invalidate(5, errorMSG = newSpc.country + " creado correctamente");
    				loadGraphs();
    				console.log("Inserted " + newSpc.country + " spc.");
    			} else if (res.status == 400) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			} else if (res.status == 409) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = newSpc.country + " " + newSpc.year + "  ya existe, recuerde que Year y Country son exclusivos.");
    				console.log("This data already exits");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	//DELETE SPECIFIC
    	async function deleteSPC(name, year) {
    		const res = await fetch("/api/v2/spc-stats/" + name + "/" + year, { method: "DELETE" }).then(function (res) {
    			$$invalidate(1, visible = true);
    			getSPC();

    			if (res.status == 200) {
    				totaldata--;
    				$$invalidate(2, color = "success");
    				$$invalidate(5, errorMSG = name + " " + year + " borrado correctamente");
    				console.log("Deleted " + name);
    			} else if (res.status == 404) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = "No se ha encontrado el objeto" + name);
    				console.log("SUICIDE NOT FOUND");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deleteSPCALL() {
    		const res = await fetch("/api/v2/spc-stats/", { method: "DELETE" }).then(function (res) {
    			getSPC();
    			$$invalidate(1, visible = true);

    			if (res.status == 200) {
    				totaldata = 0;
    				$$invalidate(2, color = "success");
    				$$invalidate(5, errorMSG = "Objetos borrados correctamente");
    				console.log("Deleted all spc.");
    			} else if (res.status == 400) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//SEARCH
    	async function searchSPC() {
    		console.log("Searching spc...");

    		if (searchSpc.country != null) {
    			busquedas += "country=" + searchSpc.country + "&";
    		}

    		if (searchSpc.both_sex != null) {
    			busquedas += "both_sex=" + searchSpc.both_sex + "&";
    		}

    		if (searchSpc.male_rank != null) {
    			busquedas += "male_rank=" + searchSpc.male_rank + "&";
    		}

    		if (searchSpc.male_number != null) {
    			busquedas += "male_number=" + searchSpc.male_number + "&";
    		}

    		if (searchSpc.female_rank != null) {
    			busquedas += "female_rank=" + searchSpc.female_rank + "&";
    		}

    		if (searchSpc.female_number != null) {
    			busquedas += "female_number=" + searchSpc.female_number + "&";
    		}

    		if (searchSpc.ratio != null) {
    			busquedas += "ratio=" + searchSpc.ratio + "&";
    		}

    		if (searchSpc.year != null) {
    			busquedas += "year=" + searchSpc.year + "&";
    		}

    		if (searchSpc.continent != null) {
    			busquedas += "continent=" + searchSpc.continent + "&";
    		}

    		const res = await fetch(busquedas);
    		busquedas = "/api/v2/spc-stats?";

    		$$invalidate(4, searchSpc = {
    			country: null,
    			both_sex: null,
    			male_rank: null,
    			male_number: null,
    			female_rank: null,
    			female_number: null,
    			ratio: null,
    			year: null,
    			continent: null
    		});

    		if (res.ok) {
    			$$invalidate(1, visible = false);
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(6, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(1, visible = true);
    			$$invalidate(2, color = "danger");
    			$$invalidate(5, errorMSG = "No se ha encontrado ningún objeto");
    			console.log("Data not found!");
    		}
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
    			$$invalidate(6, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
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
    			$$invalidate(6, spc = json);
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			$$invalidate(5, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const click_handler = () => $$invalidate(0, isOpen = !isOpen);

    	function input0_input_handler() {
    		searchSpc.country = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input1_input_handler() {
    		searchSpc.both_sex = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input2_input_handler() {
    		searchSpc.male_rank = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input3_input_handler() {
    		searchSpc.male_number = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input4_input_handler() {
    		searchSpc.female_rank = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input5_input_handler() {
    		searchSpc.female_number = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input6_input_handler() {
    		searchSpc.ratio = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input7_input_handler() {
    		searchSpc.year = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	function input8_input_handler() {
    		searchSpc.continent = this.value;
    		$$invalidate(4, searchSpc);
    	}

    	const func = () => $$invalidate(1, visible = false);

    	function input0_input_handler_1() {
    		newSpc.country = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input1_input_handler_1() {
    		newSpc.both_sex = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input2_input_handler_1() {
    		newSpc.male_rank = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input3_input_handler_1() {
    		newSpc.male_number = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input4_input_handler_1() {
    		newSpc.female_rank = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input5_input_handler_1() {
    		newSpc.female_number = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input6_input_handler_1() {
    		newSpc.ratio = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input7_input_handler_1() {
    		newSpc.year = this.value;
    		$$invalidate(3, newSpc);
    	}

    	function input8_input_handler_1() {
    		newSpc.continent = this.value;
    		$$invalidate(3, newSpc);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		UncontrolledCollapse,
    		Collapse,
    		CardBody,
    		Card,
    		isOpen,
    		busquedas,
    		visible,
    		color,
    		page,
    		totaldata,
    		spc,
    		newSpc,
    		searchSpc,
    		errorMSG,
    		getSPC,
    		getSPCLoadInitialData,
    		insertSPC,
    		deleteSPC,
    		deleteSPCALL,
    		searchSPC,
    		getNextPage,
    		getPreviewPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("busquedas" in $$props) busquedas = $$props.busquedas;
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("page" in $$props) page = $$props.page;
    		if ("totaldata" in $$props) totaldata = $$props.totaldata;
    		if ("spc" in $$props) $$invalidate(6, spc = $$props.spc);
    		if ("newSpc" in $$props) $$invalidate(3, newSpc = $$props.newSpc);
    		if ("searchSpc" in $$props) $$invalidate(4, searchSpc = $$props.searchSpc);
    		if ("errorMSG" in $$props) $$invalidate(5, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		visible,
    		color,
    		newSpc,
    		searchSpc,
    		errorMSG,
    		spc,
    		getSPCLoadInitialData,
    		insertSPC,
    		deleteSPC,
    		deleteSPCALL,
    		searchSPC,
    		getNextPage,
    		getPreviewPage,
    		busquedas,
    		page,
    		totaldata,
    		getSPC,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		func,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		input3_input_handler_1,
    		input4_input_handler_1,
    		input5_input_handler_1,
    		input6_input_handler_1,
    		input7_input_handler_1,
    		input8_input_handler_1
    	];
    }

    class Home$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /*!
     * ApexCharts v3.19.2
     * (c) 2018-2020 Juned Chhipa
     * Released under the MIT License.
     */
    function t(e){return (t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var i=0;i<e.length;i++){var a=e[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a);}}function a(t,e,a){return e&&i(t.prototype,e),a&&i(t,a),t}function s(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function r(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,a);}return i}function n(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?r(Object(i),!0).forEach((function(e){s(t,e,i[e]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e));}));}return t}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&h(t,e);}function l(t){return (l=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function h(t,e){return (h=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function c(t,e){return !e||"object"!=typeof e&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function d(t){return function(t){if(Array.isArray(t)){for(var e=0,i=new Array(t.length);e<t.length;e++)i[e]=t[e];return i}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}var g=function(){function i(){e(this,i);}return a(i,[{key:"shadeRGBColor",value:function(t,e){var i=e.split(","),a=t<0?0:255,s=t<0?-1*t:t,r=parseInt(i[0].slice(4),10),n=parseInt(i[1],10),o=parseInt(i[2],10);return "rgb("+(Math.round((a-r)*s)+r)+","+(Math.round((a-n)*s)+n)+","+(Math.round((a-o)*s)+o)+")"}},{key:"shadeHexColor",value:function(t,e){var i=parseInt(e.slice(1),16),a=t<0?0:255,s=t<0?-1*t:t,r=i>>16,n=i>>8&255,o=255&i;return "#"+(16777216+65536*(Math.round((a-r)*s)+r)+256*(Math.round((a-n)*s)+n)+(Math.round((a-o)*s)+o)).toString(16).slice(1)}},{key:"shadeColor",value:function(t,e){return i.isColorHex(e)?this.shadeHexColor(t,e):this.shadeRGBColor(t,e)}}],[{key:"bind",value:function(t,e){return function(){return t.apply(e,arguments)}}},{key:"isObject",value:function(e){return e&&"object"===t(e)&&!Array.isArray(e)&&null!=e}},{key:"listToArray",value:function(t){var e,i=[];for(e=0;e<t.length;e++)i[e]=t[e];return i}},{key:"extend",value:function(t,e){var i=this;"function"!=typeof Object.assign&&(Object.assign=function(t){if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var e=Object(t),i=1;i<arguments.length;i++){var a=arguments[i];if(null!=a)for(var s in a)a.hasOwnProperty(s)&&(e[s]=a[s]);}return e});var a=Object.assign({},t);return this.isObject(t)&&this.isObject(e)&&Object.keys(e).forEach((function(r){i.isObject(e[r])&&r in t?a[r]=i.extend(t[r],e[r]):Object.assign(a,s({},r,e[r]));})),a}},{key:"extendArray",value:function(t,e){var a=[];return t.map((function(t){a.push(i.extend(e,t));})),t=a}},{key:"monthMod",value:function(t){return t%12}},{key:"clone",value:function(e){if("[object Array]"===Object.prototype.toString.call(e)){for(var i=[],a=0;a<e.length;a++)i[a]=this.clone(e[a]);return i}if("[object Null]"===Object.prototype.toString.call(e))return null;if("object"===t(e)){var s={};for(var r in e)e.hasOwnProperty(r)&&(s[r]=this.clone(e[r]));return s}return e}},{key:"log10",value:function(t){return Math.log(t)/Math.LN10}},{key:"roundToBase10",value:function(t){return Math.pow(10,Math.floor(Math.log10(t)))}},{key:"roundToBase",value:function(t,e){return Math.pow(e,Math.floor(Math.log(t)/Math.log(e)))}},{key:"parseNumber",value:function(t){return null===t?t:parseFloat(t)}},{key:"randomId",value:function(){return (Math.random()+1).toString(36).substring(4)}},{key:"noExponents",value:function(t){var e=String(t).split(/[eE]/);if(1===e.length)return e[0];var i="",a=t<0?"-":"",s=e[0].replace(".",""),r=Number(e[1])+1;if(r<0){for(i=a+"0.";r++;)i+="0";return i+s.replace(/^-/,"")}for(r-=s.length;r--;)i+="0";return s+i}},{key:"getDimensions",value:function(t){var e=getComputedStyle(t),i=[],a=t.clientHeight,s=t.clientWidth;return a-=parseFloat(e.paddingTop)+parseFloat(e.paddingBottom),s-=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight),i.push(s),i.push(a),i}},{key:"getBoundingClientRect",value:function(t){var e=t.getBoundingClientRect();return {top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:t.clientWidth,height:t.clientHeight,x:e.left,y:e.top}}},{key:"getLargestStringFromArr",value:function(t){return t.reduce((function(t,e){return Array.isArray(e)&&(e=e.reduce((function(t,e){return t.length>e.length?t:e}))),t.length>e.length?t:e}),0)}},{key:"hexToRgba",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"#999999",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:.6;"#"!==t.substring(0,1)&&(t="#999999");var i=t.replace("#","");i=i.match(new RegExp("(.{"+i.length/3+"})","g"));for(var a=0;a<i.length;a++)i[a]=parseInt(1===i[a].length?i[a]+i[a]:i[a],16);return void 0!==e&&i.push(e),"rgba("+i.join(",")+")"}},{key:"getOpacityFromRGBA",value:function(t){return parseFloat(t.replace(/^.*,(.+)\)/,"$1"))}},{key:"rgb2hex",value:function(t){return (t=t.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i))&&4===t.length?"#"+("0"+parseInt(t[1],10).toString(16)).slice(-2)+("0"+parseInt(t[2],10).toString(16)).slice(-2)+("0"+parseInt(t[3],10).toString(16)).slice(-2):""}},{key:"isColorHex",value:function(t){return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^#[0-9A-F]{8}$)/i.test(t)}},{key:"polarToCartesian",value:function(t,e,i,a){var s=(a-90)*Math.PI/180;return {x:t+i*Math.cos(s),y:e+i*Math.sin(s)}}},{key:"escapeString",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"x",i=t.toString().slice();return i=i.replace(/[` ~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi,e)}},{key:"negToZero",value:function(t){return t<0?0:t}},{key:"moveIndexInArray",value:function(t,e,i){if(i>=t.length)for(var a=i-t.length+1;a--;)t.push(void 0);return t.splice(i,0,t.splice(e,1)[0]),t}},{key:"extractNumber",value:function(t){return parseFloat(t.replace(/[^\d.]*/g,""))}},{key:"findAncestor",value:function(t,e){for(;(t=t.parentElement)&&!t.classList.contains(e););return t}},{key:"setELstyles",value:function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t.style.key=e[i]);}},{key:"isNumber",value:function(t){return !isNaN(t)&&parseFloat(Number(t))===t&&!isNaN(parseInt(t,10))}},{key:"isFloat",value:function(t){return Number(t)===t&&t%1!=0}},{key:"isSafari",value:function(){return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)}},{key:"isFirefox",value:function(){return navigator.userAgent.toLowerCase().indexOf("firefox")>-1}},{key:"isIE11",value:function(){if(-1!==window.navigator.userAgent.indexOf("MSIE")||window.navigator.appVersion.indexOf("Trident/")>-1)return !0}},{key:"isIE",value:function(){var t=window.navigator.userAgent,e=t.indexOf("MSIE ");if(e>0)return parseInt(t.substring(e+5,t.indexOf(".",e)),10);if(t.indexOf("Trident/")>0){var i=t.indexOf("rv:");return parseInt(t.substring(i+3,t.indexOf(".",i)),10)}var a=t.indexOf("Edge/");return a>0&&parseInt(t.substring(a+5,t.indexOf(".",a)),10)}}]),i}(),u=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"getDefaultFilter",value:function(t,e){var i=this.w;t.unfilter(!0),(new window.SVG.Filter).size("120%","180%","-5%","-40%"),"none"!==i.config.states.normal.filter?this.applyFilter(t,e,i.config.states.normal.filter.type,i.config.states.normal.filter.value):i.config.chart.dropShadow.enabled&&this.dropShadow(t,i.config.chart.dropShadow,e);}},{key:"addNormalFilter",value:function(t,e){var i=this.w;i.config.chart.dropShadow.enabled&&!t.node.classList.contains("apexcharts-marker")&&this.dropShadow(t,i.config.chart.dropShadow,e);}},{key:"addLightenFilter",value:function(t,e,i){var a=this,s=this.w,r=i.intensity;if(!g.isFirefox()){t.unfilter(!0);new window.SVG.Filter;t.filter((function(t){var i=s.config.chart.dropShadow;(i.enabled?a.addShadow(t,e,i):t).componentTransfer({rgb:{type:"linear",slope:1.5,intercept:r}});})),t.filterer.node.setAttribute("filterUnits","userSpaceOnUse"),this._scaleFilterSize(t.filterer.node);}}},{key:"addDarkenFilter",value:function(t,e,i){var a=this,s=this.w,r=i.intensity;if(!g.isFirefox()){t.unfilter(!0);new window.SVG.Filter;t.filter((function(t){var i=s.config.chart.dropShadow;(i.enabled?a.addShadow(t,e,i):t).componentTransfer({rgb:{type:"linear",slope:r}});})),t.filterer.node.setAttribute("filterUnits","userSpaceOnUse"),this._scaleFilterSize(t.filterer.node);}}},{key:"applyFilter",value:function(t,e,i){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:.5;switch(i){case"none":this.addNormalFilter(t,e);break;case"lighten":this.addLightenFilter(t,e,{intensity:a});break;case"darken":this.addDarkenFilter(t,e,{intensity:a});}}},{key:"addShadow",value:function(t,e,i){var a=i.blur,s=i.top,r=i.left,n=i.color,o=i.opacity,l=t.flood(Array.isArray(n)?n[e]:n,o).composite(t.sourceAlpha,"in").offset(r,s).gaussianBlur(a).merge(t.source);return t.blend(t.source,l)}},{key:"dropShadow",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,a=e.top,s=e.left,r=e.blur,n=e.color,o=e.opacity,l=e.noUserSpaceOnUse,h=this.w;return t.unfilter(!0),g.isIE()&&"radialBar"===h.config.chart.type?t:(n=Array.isArray(n)?n[i]:n,t.filter((function(t){var e=null;e=g.isSafari()||g.isFirefox()||g.isIE()?t.flood(n,o).composite(t.sourceAlpha,"in").offset(s,a).gaussianBlur(r):t.flood(n,o).composite(t.sourceAlpha,"in").offset(s,a).gaussianBlur(r).merge(t.source),t.blend(t.source,e);})),l||t.filterer.node.setAttribute("filterUnits","userSpaceOnUse"),this._scaleFilterSize(t.filterer.node),t)}},{key:"setSelectionFilter",value:function(t,e,i){var a=this.w;if(void 0!==a.globals.selectedDataPoints[e]&&a.globals.selectedDataPoints[e].indexOf(i)>-1){t.node.setAttribute("selected",!0);var s=a.config.states.active.filter;"none"!==s&&this.applyFilter(t,e,s.type,s.value);}}},{key:"_scaleFilterSize",value:function(t){!function(e){for(var i in e)e.hasOwnProperty(i)&&t.setAttribute(i,e[i]);}({width:"200%",height:"200%",x:"-50%",y:"-50%"});}}]),t}(),f=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.setEasingFunctions();}return a(t,[{key:"setEasingFunctions",value:function(){var t;if(!this.w.globals.easing){switch(this.w.config.chart.animations.easing){case"linear":t="-";break;case"easein":t="<";break;case"easeout":t=">";break;case"easeinout":t="<>";break;case"swing":t=function(t){var e=1.70158;return (t-=1)*t*((e+1)*t+e)+1};break;case"bounce":t=function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375};break;case"elastic":t=function(t){return t===!!t?t:Math.pow(2,-10*t)*Math.sin((t-.075)*(2*Math.PI)/.3)+1};break;default:t="<>";}this.w.globals.easing=t;}}},{key:"animateLine",value:function(t,e,i,a){t.attr(e).animate(a).attr(i);}},{key:"animateCircleRadius",value:function(t,e,i,a,s,r){e||(e=0),t.attr({r:e}).animate(a,s).attr({r:i}).afterAll((function(){r();}));}},{key:"animateCircle",value:function(t,e,i,a,s){t.attr({r:e.r,cx:e.cx,cy:e.cy}).animate(a,s).attr({r:i.r,cx:i.cx,cy:i.cy});}},{key:"animateRect",value:function(t,e,i,a,s){t.attr(e).animate(a).attr(i).afterAll((function(){return s()}));}},{key:"animatePathsGradually",value:function(t){var e=t.el,i=t.realIndex,a=t.j,s=t.fill,r=t.pathFrom,n=t.pathTo,o=t.speed,l=t.delay,h=this.w,c=0;h.config.chart.animations.animateGradually.enabled&&(c=h.config.chart.animations.animateGradually.delay),h.config.chart.animations.dynamicAnimation.enabled&&h.globals.dataChanged&&"bar"!==h.config.chart.type&&(c=0),this.morphSVG(e,i,a,"line"!==h.config.chart.type||h.globals.comboCharts?s:"stroke",r,n,o,l*c);}},{key:"showDelayedElements",value:function(){this.w.globals.delayedElements.forEach((function(t){t.el.classList.remove("apexcharts-element-hidden");}));}},{key:"animationCompleted",value:function(t){var e=this.w;e.globals.animationEnded||(e.globals.animationEnded=!0,this.showDelayedElements(),"function"==typeof e.config.chart.events.animationEnd&&e.config.chart.events.animationEnd(this.ctx,{el:t,w:e}));}},{key:"morphSVG",value:function(t,e,i,a,s,r,n,o){var l=this,h=this.w;s||(s=t.attr("pathFrom")),r||(r=t.attr("pathTo"));var c=function(t){return "radar"===h.config.chart.type&&(n=1),"M 0 ".concat(h.globals.gridHeight)};(!s||s.indexOf("undefined")>-1||s.indexOf("NaN")>-1)&&(s=c()),(r.indexOf("undefined")>-1||r.indexOf("NaN")>-1)&&(r=c()),h.globals.shouldAnimate||(n=1),t.plot(s).animate(1,h.globals.easing,o).plot(s).animate(n,h.globals.easing,o).plot(r).afterAll((function(){g.isNumber(i)?i===h.globals.series[h.globals.maxValsInArrayIndex].length-2&&h.globals.shouldAnimate&&l.animationCompleted(t):"none"!==a&&h.globals.shouldAnimate&&(!h.globals.comboCharts&&e===h.globals.series.length-1||h.globals.comboCharts)&&l.animationCompleted(t),l.showDelayedElements();}));}}]),t}(),p=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"drawLine",value:function(t,e,i,a){var s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"#a8a8a8",r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,n=arguments.length>6&&void 0!==arguments[6]?arguments[6]:null,o=this.w,l=o.globals.dom.Paper.line().attr({x1:t,y1:e,x2:i,y2:a,stroke:s,"stroke-dasharray":r,"stroke-width":n});return l}},{key:"drawRect",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"#fefefe",n=arguments.length>6&&void 0!==arguments[6]?arguments[6]:1,o=arguments.length>7&&void 0!==arguments[7]?arguments[7]:null,l=arguments.length>8&&void 0!==arguments[8]?arguments[8]:null,h=arguments.length>9&&void 0!==arguments[9]?arguments[9]:0,c=this.w,d=c.globals.dom.Paper.rect();return d.attr({x:t,y:e,width:i>0?i:0,height:a>0?a:0,rx:s,ry:s,opacity:n,"stroke-width":null!==o?o:0,stroke:null!==l?l:"none","stroke-dasharray":h}),d.node.setAttribute("fill",r),d}},{key:"drawPolygon",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"#e1e1e1",i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",s=this.w,r=s.globals.dom.Paper.polygon(t).attr({fill:a,stroke:e,"stroke-width":i});return r}},{key:"drawCircle",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.w,a=i.globals.dom.Paper.circle(2*t);return null!==e&&a.attr(e),a}},{key:"drawPath",value:function(t){var e=t.d,i=void 0===e?"":e,a=t.stroke,s=void 0===a?"#a8a8a8":a,r=t.strokeWidth,n=void 0===r?1:r,o=t.fill,l=t.fillOpacity,h=void 0===l?1:l,c=t.strokeOpacity,d=void 0===c?1:c,g=t.classes,u=t.strokeLinecap,f=void 0===u?null:u,p=t.strokeDashArray,x=void 0===p?0:p,b=this.w;return null===f&&(f=b.config.stroke.lineCap),(i.indexOf("undefined")>-1||i.indexOf("NaN")>-1)&&(i="M 0 ".concat(b.globals.gridHeight)),b.globals.dom.Paper.path(i).attr({fill:o,"fill-opacity":h,stroke:s,"stroke-opacity":d,"stroke-linecap":f,"stroke-width":n,"stroke-dasharray":x,class:g})}},{key:"group",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,e=this.w,i=e.globals.dom.Paper.group();return null!==t&&i.attr(t),i}},{key:"move",value:function(t,e){var i=["M",t,e].join(" ");return i}},{key:"line",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=null;return null===i?a=["L",t,e].join(" "):"H"===i?a=["H",t].join(" "):"V"===i&&(a=["V",e].join(" ")),a}},{key:"curve",value:function(t,e,i,a,s,r){var n=["C",t,e,i,a,s,r].join(" ");return n}},{key:"quadraticCurve",value:function(t,e,i,a){return ["Q",t,e,i,a].join(" ")}},{key:"arc",value:function(t,e,i,a,s,r,n){var o=arguments.length>7&&void 0!==arguments[7]&&arguments[7],l="A";o&&(l="a");var h=[l,t,e,i,a,s,r,n].join(" ");return h}},{key:"renderPaths",value:function(t){var e,i=t.j,a=t.realIndex,s=t.pathFrom,r=t.pathTo,o=t.stroke,l=t.strokeWidth,h=t.strokeLinecap,c=t.fill,d=t.animationDelay,g=t.initialSpeed,p=t.dataChangeSpeed,x=t.className,b=t.shouldClipToGrid,m=void 0===b||b,v=t.bindEventsOnPaths,y=void 0===v||v,w=t.drawShadow,k=void 0===w||w,A=this.w,S=new u(this.ctx),C=new f(this.ctx),L=this.w.config.chart.animations.enabled,P=L&&this.w.config.chart.animations.dynamicAnimation.enabled,T=!!(L&&!A.globals.resized||P&&A.globals.dataChanged&&A.globals.shouldAnimate);T?e=s:(e=r,A.globals.animationEnded=!0);var z=A.config.stroke.dashArray,I=0;I=Array.isArray(z)?z[a]:A.config.stroke.dashArray;var M=this.drawPath({d:e,stroke:o,strokeWidth:l,fill:c,fillOpacity:1,classes:x,strokeLinecap:h,strokeDashArray:I});if(M.attr("index",a),m&&M.attr({"clip-path":"url(#gridRectMask".concat(A.globals.cuid,")")}),"none"!==A.config.states.normal.filter.type)S.getDefaultFilter(M,a);else if(A.config.chart.dropShadow.enabled&&k&&(!A.config.chart.dropShadow.enabledOnSeries||A.config.chart.dropShadow.enabledOnSeries&&-1!==A.config.chart.dropShadow.enabledOnSeries.indexOf(a))){var E=A.config.chart.dropShadow;S.dropShadow(M,E,a);}y&&(M.node.addEventListener("mouseenter",this.pathMouseEnter.bind(this,M)),M.node.addEventListener("mouseleave",this.pathMouseLeave.bind(this,M)),M.node.addEventListener("mousedown",this.pathMouseDown.bind(this,M))),M.attr({pathTo:r,pathFrom:s});var X={el:M,j:i,realIndex:a,pathFrom:s,pathTo:r,fill:c,strokeWidth:l,delay:d};return !L||A.globals.resized||A.globals.dataChanged?!A.globals.resized&&A.globals.dataChanged||C.showDelayedElements():C.animatePathsGradually(n({},X,{speed:g})),A.globals.dataChanged&&P&&T&&C.animatePathsGradually(n({},X,{speed:p})),M}},{key:"drawPattern",value:function(t,e,i){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"#a8a8a8",s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,r=this.w,n=r.globals.dom.Paper.pattern(e,i,(function(r){"horizontalLines"===t?r.line(0,0,i,0).stroke({color:a,width:s+1}):"verticalLines"===t?r.line(0,0,0,e).stroke({color:a,width:s+1}):"slantedLines"===t?r.line(0,0,e,i).stroke({color:a,width:s}):"squares"===t?r.rect(e,i).fill("none").stroke({color:a,width:s}):"circles"===t&&r.circle(e).fill("none").stroke({color:a,width:s});}));return n}},{key:"drawGradient",value:function(t,e,i,a,s){var r,n=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,o=arguments.length>6&&void 0!==arguments[6]?arguments[6]:null,l=arguments.length>7&&void 0!==arguments[7]?arguments[7]:null,h=arguments.length>8&&void 0!==arguments[8]?arguments[8]:0,c=this.w;e.length<9&&0===e.indexOf("#")&&(e=g.hexToRgba(e,a)),i.length<9&&0===i.indexOf("#")&&(i=g.hexToRgba(i,s));var d=0,u=1,f=1,p=null;null!==o&&(d=void 0!==o[0]?o[0]/100:0,u=void 0!==o[1]?o[1]/100:1,f=void 0!==o[2]?o[2]/100:1,p=void 0!==o[3]?o[3]/100:null);var x=!("donut"!==c.config.chart.type&&"pie"!==c.config.chart.type&&"polarArea"!==c.config.chart.type&&"bubble"!==c.config.chart.type);if(r=null===l||0===l.length?c.globals.dom.Paper.gradient(x?"radial":"linear",(function(t){t.at(d,e,a),t.at(u,i,s),t.at(f,i,s),null!==p&&t.at(p,e,a);})):c.globals.dom.Paper.gradient(x?"radial":"linear",(function(t){(Array.isArray(l[h])?l[h]:l).forEach((function(e){t.at(e.offset/100,e.color,e.opacity);}));})),x){var b=c.globals.gridWidth/2,m=c.globals.gridHeight/2;"bubble"!==c.config.chart.type?r.attr({gradientUnits:"userSpaceOnUse",cx:b,cy:m,r:n}):r.attr({cx:.5,cy:.5,r:.8,fx:.2,fy:.2});}else "vertical"===t?r.from(0,0).to(0,1):"diagonal"===t?r.from(0,0).to(1,1):"horizontal"===t?r.from(0,1).to(1,1):"diagonal2"===t&&r.from(1,0).to(0,1);return r}},{key:"drawText",value:function(t){var e,i=t.x,a=t.y,s=t.text,r=t.textAnchor,n=t.fontSize,o=t.fontFamily,l=t.fontWeight,h=t.foreColor,c=t.opacity,d=t.cssClass,g=void 0===d?"":d,u=t.isPlainText,f=void 0===u||u,p=this.w;return void 0===s&&(s=""),r||(r="start"),h&&h.length||(h=p.config.chart.foreColor),o=o||p.config.chart.fontFamily,l=l||"regular",(e=Array.isArray(s)?p.globals.dom.Paper.text((function(t){for(var e=0;e<s.length;e++)0===e?t.tspan(s[e]):t.tspan(s[e]).newLine();})):f?p.globals.dom.Paper.plain(s):p.globals.dom.Paper.text((function(t){return t.tspan(s)}))).attr({x:i,y:a,"text-anchor":r,"dominant-baseline":"auto","font-size":n,"font-family":o,"font-weight":l,fill:h,class:"apexcharts-text "+g}),e.node.style.fontFamily=o,e.node.style.opacity=c,e}},{key:"drawMarker",value:function(t,e,i){t=t||0;var a=i.pSize||0,s=null;if("square"===i.shape){var r=void 0===i.pRadius?a/2:i.pRadius;null!==e&&a||(a=0,r=0);var n=1.2*a+r,o=this.drawRect(n,n,n,n,r);o.attr({x:t-n/2,y:e-n/2,cx:t,cy:e,class:i.class?i.class:"",fill:i.pointFillColor,"fill-opacity":i.pointFillOpacity?i.pointFillOpacity:1,stroke:i.pointStrokeColor,"stroke-width":i.pWidth?i.pWidth:0,"stroke-opacity":i.pointStrokeOpacity?i.pointStrokeOpacity:1}),s=o;}else "circle"!==i.shape&&i.shape||(g.isNumber(e)||(a=0,e=0),s=this.drawCircle(a,{cx:t,cy:e,class:i.class?i.class:"",stroke:i.pointStrokeColor,fill:i.pointFillColor,"fill-opacity":i.pointFillOpacity?i.pointFillOpacity:1,"stroke-width":i.pWidth?i.pWidth:0,"stroke-opacity":i.pointStrokeOpacity?i.pointStrokeOpacity:1}));return s}},{key:"pathMouseEnter",value:function(t,e){var i=this.w,a=new u(this.ctx),s=parseInt(t.node.getAttribute("index"),10),r=parseInt(t.node.getAttribute("j"),10);if("function"==typeof i.config.chart.events.dataPointMouseEnter&&i.config.chart.events.dataPointMouseEnter(e,this.ctx,{seriesIndex:s,dataPointIndex:r,w:i}),this.ctx.events.fireEvent("dataPointMouseEnter",[e,this.ctx,{seriesIndex:s,dataPointIndex:r,w:i}]),("none"===i.config.states.active.filter.type||"true"!==t.node.getAttribute("selected"))&&"none"!==i.config.states.hover.filter.type&&"none"!==i.config.states.active.filter.type&&!i.globals.isTouchDevice){var n=i.config.states.hover.filter;a.applyFilter(t,s,n.type,n.value);}}},{key:"pathMouseLeave",value:function(t,e){var i=this.w,a=new u(this.ctx),s=parseInt(t.node.getAttribute("index"),10),r=parseInt(t.node.getAttribute("j"),10);"function"==typeof i.config.chart.events.dataPointMouseLeave&&i.config.chart.events.dataPointMouseLeave(e,this.ctx,{seriesIndex:s,dataPointIndex:r,w:i}),this.ctx.events.fireEvent("dataPointMouseLeave",[e,this.ctx,{seriesIndex:s,dataPointIndex:r,w:i}]),"none"!==i.config.states.active.filter.type&&"true"===t.node.getAttribute("selected")||"none"!==i.config.states.hover.filter.type&&a.getDefaultFilter(t,s);}},{key:"pathMouseDown",value:function(t,e){var i=this.w,a=new u(this.ctx),s=parseInt(t.node.getAttribute("index"),10),r=parseInt(t.node.getAttribute("j"),10),n="false";if("true"===t.node.getAttribute("selected")){if(t.node.setAttribute("selected","false"),i.globals.selectedDataPoints[s].indexOf(r)>-1){var o=i.globals.selectedDataPoints[s].indexOf(r);i.globals.selectedDataPoints[s].splice(o,1);}}else {if(!i.config.states.active.allowMultipleDataPointsSelection&&i.globals.selectedDataPoints.length>0){i.globals.selectedDataPoints=[];var l=i.globals.dom.Paper.select(".apexcharts-series path").members,h=i.globals.dom.Paper.select(".apexcharts-series circle, .apexcharts-series rect").members,c=function(t){Array.prototype.forEach.call(t,(function(t){t.node.setAttribute("selected","false"),a.getDefaultFilter(t,s);}));};c(l),c(h);}t.node.setAttribute("selected","true"),n="true",void 0===i.globals.selectedDataPoints[s]&&(i.globals.selectedDataPoints[s]=[]),i.globals.selectedDataPoints[s].push(r);}if("true"===n){var d=i.config.states.active.filter;"none"!==d&&a.applyFilter(t,s,d.type,d.value);}else "none"!==i.config.states.active.filter.type&&a.getDefaultFilter(t,s);"function"==typeof i.config.chart.events.dataPointSelection&&i.config.chart.events.dataPointSelection(e,this.ctx,{selectedDataPoints:i.globals.selectedDataPoints,seriesIndex:s,dataPointIndex:r,w:i}),e&&this.ctx.events.fireEvent("dataPointSelection",[e,this.ctx,{selectedDataPoints:i.globals.selectedDataPoints,seriesIndex:s,dataPointIndex:r,w:i}]);}},{key:"rotateAroundCenter",value:function(t){var e=t.getBBox();return {x:e.x+e.width/2,y:e.y+e.height/2}}},{key:"getTextRects",value:function(t,e,i,a){var s=!(arguments.length>4&&void 0!==arguments[4])||arguments[4],r=this.w,n=this.drawText({x:-200,y:-200,text:t,textAnchor:"start",fontSize:e,fontFamily:i,foreColor:"#fff",opacity:0});a&&n.attr("transform",a),r.globals.dom.Paper.add(n);var o=n.bbox();return s||(o=n.node.getBoundingClientRect()),n.remove(),{width:o.width,height:o.height}}},{key:"placeTextWithEllipsis",value:function(t,e,i){if("function"==typeof t.getComputedTextLength&&(t.textContent=e,e.length>0&&t.getComputedTextLength()>=i/.8)){for(var a=e.length-3;a>0;a-=3)if(t.getSubStringLength(0,a)<=i/.8)return void(t.textContent=e.substring(0,a)+"...");t.textContent=".";}}}],[{key:"setAttrs",value:function(t,e){for(var i in e)e.hasOwnProperty(i)&&t.setAttribute(i,e[i]);}}]),t}(),x=function(){function t(i){e(this,t),this.w=i.w,this.annoCtx=i;}return a(t,[{key:"setOrientations",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.w;if("vertical"===t.label.orientation){var a=null!==e?e:0,s=i.globals.dom.baseEl.querySelector(".apexcharts-xaxis-annotations .apexcharts-xaxis-annotation-label[rel='".concat(a,"']"));if(null!==s){var r=s.getBoundingClientRect();s.setAttribute("x",parseFloat(s.getAttribute("x"))-r.height+4),"top"===t.label.position?s.setAttribute("y",parseFloat(s.getAttribute("y"))+r.width):s.setAttribute("y",parseFloat(s.getAttribute("y"))-r.width);var n=this.annoCtx.graphics.rotateAroundCenter(s),o=n.x,l=n.y;s.setAttribute("transform","rotate(-90 ".concat(o," ").concat(l,")"));}}}},{key:"addBackgroundToAnno",value:function(t,e){var i=this.w;if(!e.label.text||e.label.text&&!e.label.text.trim())return null;var a=i.globals.dom.baseEl.querySelector(".apexcharts-grid").getBoundingClientRect(),s=t.getBoundingClientRect(),r=e.label.style.padding.left,n=e.label.style.padding.right,o=e.label.style.padding.top,l=e.label.style.padding.bottom;"vertical"===e.label.orientation&&(o=e.label.style.padding.left,l=e.label.style.padding.right,r=e.label.style.padding.top,n=e.label.style.padding.bottom);var h=s.left-a.left-r,c=s.top-a.top-o,d=this.annoCtx.graphics.drawRect(h-i.globals.barPadForNumericAxis,c,s.width+r+n,s.height+o+l,e.label.borderRadius,e.label.style.background,1,e.label.borderWidth,e.label.borderColor,0);return e.id&&d.node.classList.add(e.id),d}},{key:"annotationsBackground",value:function(){var t=this,e=this.w,i=function(i,a,s){var r=e.globals.dom.baseEl.querySelector(".apexcharts-".concat(s,"-annotations .apexcharts-").concat(s,"-annotation-label[rel='").concat(a,"']"));if(r){var n=r.parentNode,o=t.addBackgroundToAnno(r,i);o&&n.insertBefore(o.node,r);}};e.config.annotations.xaxis.map((function(t,e){i(t,e,"xaxis");})),e.config.annotations.yaxis.map((function(t,e){i(t,e,"yaxis");})),e.config.annotations.points.map((function(t,e){i(t,e,"point");}));}},{key:"makeAnnotationDraggable",value:function(t,e,i){var a=this.w.config.annotations[e][i];t.draggable().on("dragend",(function(t){var e=t.target.getAttribute("x"),i=t.target.getAttribute("y"),s=t.target.getAttribute("cx"),r=t.target.getAttribute("cy");a.x=e,a.y=i,s&&r&&(a.x=s,a.y=r);})),t.node.addEventListener("mousedown",(function(e){e.stopPropagation(),t.selectize({pointSize:8,rotationPoint:!1,pointType:"rect"}),t.resize().on("resizedone",(function(t){var e=t.target.getAttribute("width"),i=t.target.getAttribute("height"),s=t.target.getAttribute("r");a.width=e,a.height=i,s&&(a.radius=s);}));}));}},{key:"getStringX",value:function(t){var e=this.w,i=t;e.config.xaxis.convertedCatToNumeric&&e.globals.categoryLabels.length&&(t=e.globals.categoryLabels.indexOf(t)+1);var a=e.globals.labels.indexOf(t),s=e.globals.dom.baseEl.querySelector(".apexcharts-xaxis-texts-g text:nth-child("+(a+1)+")");return s&&(i=parseFloat(s.getAttribute("x"))),i}}]),t}(),b=function(){function t(i){e(this,t),this.w=i.w,this.annoCtx=i,this.invertAxis=this.annoCtx.invertAxis;}return a(t,[{key:"addXaxisAnnotation",value:function(t,e,i){var a=this.w,s=this.invertAxis?a.globals.minY:a.globals.minX,r=this.invertAxis?a.globals.maxY:a.globals.maxX,n=this.invertAxis?a.globals.yRange[0]:a.globals.xRange,o=(t.x-s)/(n/a.globals.gridWidth);this.annoCtx.inversedReversedAxis&&(o=(r-t.x)/(n/a.globals.gridWidth));var l=t.label.text;"category"!==a.config.xaxis.type&&!a.config.xaxis.convertedCatToNumeric||this.invertAxis||a.globals.dataFormatXNumeric||(o=this.annoCtx.helpers.getStringX(t.x));var h=t.strokeDashArray;if(g.isNumber(o)){if(null===t.x2||void 0===t.x2){var c=this.annoCtx.graphics.drawLine(o+t.offsetX,0+t.offsetY,o+t.offsetX,a.globals.gridHeight+t.offsetY,t.borderColor,h,t.borderWidth);e.appendChild(c.node),t.id&&c.node.classList.add(t.id);}else {var d=(t.x2-s)/(n/a.globals.gridWidth);if(this.annoCtx.inversedReversedAxis&&(d=(r-t.x2)/(n/a.globals.gridWidth)),"category"!==a.config.xaxis.type&&!a.config.xaxis.convertedCatToNumeric||this.invertAxis||a.globals.dataFormatXNumeric||(d=this.annoCtx.helpers.getStringX(t.x2)),d<o){var u=o;o=d,d=u;}var f=this.annoCtx.graphics.drawRect(o+t.offsetX,0+t.offsetY,d-o,a.globals.gridHeight+t.offsetY,0,t.fillColor,t.opacity,1,t.borderColor,h);f.node.classList.add("apexcharts-annotation-rect"),f.attr("clip-path","url(#gridRectMask".concat(a.globals.cuid,")")),e.appendChild(f.node),t.id&&f.node.classList.add(t.id);}var p="top"===t.label.position?4:a.globals.gridHeight,x=this.annoCtx.graphics.getTextRects(l,parseFloat(t.label.style.fontSize)),b=this.annoCtx.graphics.drawText({x:o+t.label.offsetX,y:p+t.label.offsetY-("vertical"===t.label.orientation?"top"===t.label.position?x.width/2-12:-x.width/2:0),text:l,textAnchor:t.label.textAnchor,fontSize:t.label.style.fontSize,fontFamily:t.label.style.fontFamily,fontWeight:t.label.style.fontWeight,foreColor:t.label.style.color,cssClass:"apexcharts-xaxis-annotation-label ".concat(t.label.style.cssClass," ").concat(t.id?t.id:"")});b.attr({rel:i}),e.appendChild(b.node),this.annoCtx.helpers.setOrientations(t,i);}}},{key:"drawXAxisAnnotations",value:function(){var t=this,e=this.w,i=this.annoCtx.graphics.group({class:"apexcharts-xaxis-annotations"});return e.config.annotations.xaxis.map((function(e,a){t.addXaxisAnnotation(e,i.node,a);})),i}}]),t}(),m=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"getStackedSeriesTotals",value:function(){var t=this.w,e=[];if(0===t.globals.series.length)return e;for(var i=0;i<t.globals.series[t.globals.maxValsInArrayIndex].length;i++){for(var a=0,s=0;s<t.globals.series.length;s++)void 0!==t.globals.series[s][i]&&(a+=t.globals.series[s][i]);e.push(a);}return t.globals.stackedSeriesTotals=e,e}},{key:"getSeriesTotalByIndex",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return null===t?this.w.config.series.reduce((function(t,e){return t+e}),0):this.w.globals.series[t].reduce((function(t,e){return t+e}),0)}},{key:"isSeriesNull",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return 0===(null===t?this.w.config.series.filter((function(t){return null!==t})):this.w.config.series[t].data.filter((function(t){return null!==t}))).length}},{key:"seriesHaveSameValues",value:function(t){return this.w.globals.series[t].every((function(t,e,i){return t===i[0]}))}},{key:"getCategoryLabels",value:function(t){var e=this.w,i=t.slice();return e.config.xaxis.convertedCatToNumeric&&(i=t.map((function(t){return e.config.xaxis.labels.formatter(t-e.globals.minX+1)}))),i}},{key:"getLargestSeries",value:function(){var t=this.w;t.globals.maxValsInArrayIndex=t.globals.series.map((function(t){return t.length})).indexOf(Math.max.apply(Math,t.globals.series.map((function(t){return t.length}))));}},{key:"getLargestMarkerSize",value:function(){var t=this.w,e=0;return t.globals.markers.size.forEach((function(t){e=Math.max(e,t);})),t.globals.markers.largestSize=e,e}},{key:"getSeriesTotals",value:function(){var t=this.w;t.globals.seriesTotals=t.globals.series.map((function(t,e){var i=0;if(Array.isArray(t))for(var a=0;a<t.length;a++)i+=t[a];else i+=t;return i}));}},{key:"getSeriesTotalsXRange",value:function(t,e){var i=this.w;return i.globals.series.map((function(a,s){for(var r=0,n=0;n<a.length;n++)i.globals.seriesX[s][n]>t&&i.globals.seriesX[s][n]<e&&(r+=a[n]);return r}))}},{key:"getPercentSeries",value:function(){var t=this.w;t.globals.seriesPercent=t.globals.series.map((function(e,i){var a=[];if(Array.isArray(e))for(var s=0;s<e.length;s++){var r=t.globals.stackedSeriesTotals[s],n=0;r&&(n=100*e[s]/r),a.push(n);}else {var o=100*e/t.globals.seriesTotals.reduce((function(t,e){return t+e}),0);a.push(o);}return a}));}},{key:"getCalculatedRatios",value:function(){var t,e,i,a,s=this.w.globals,r=[],n=0,o=[],l=.1,h=0;if(s.yRange=[],s.isMultipleYAxis)for(var c=0;c<s.minYArr.length;c++)s.yRange.push(Math.abs(s.minYArr[c]-s.maxYArr[c])),o.push(0);else s.yRange.push(Math.abs(s.minY-s.maxY));s.xRange=Math.abs(s.maxX-s.minX),s.zRange=Math.abs(s.maxZ-s.minZ);for(var d=0;d<s.yRange.length;d++)r.push(s.yRange[d]/s.gridHeight);if(e=s.xRange/s.gridWidth,i=Math.abs(s.initialMaxX-s.initialMinX)/s.gridWidth,t=s.yRange/s.gridWidth,a=s.xRange/s.gridHeight,(n=s.zRange/s.gridHeight*16)||(n=1),s.minY!==Number.MIN_VALUE&&0!==Math.abs(s.minY)&&(s.hasNegs=!0),s.isMultipleYAxis){o=[];for(var g=0;g<r.length;g++)o.push(-s.minYArr[g]/r[g]);}else o.push(-s.minY/r[0]),s.minY!==Number.MIN_VALUE&&0!==Math.abs(s.minY)&&(l=-s.minY/t,h=s.minX/e);return {yRatio:r,invertedYRatio:t,zRatio:n,xRatio:e,initialXRatio:i,invertedXRatio:a,baseLineInvertedY:l,baseLineY:o,baseLineX:h}}},{key:"getLogSeries",value:function(t){var e=this,i=this.w;return i.globals.seriesLog=t.map((function(t,a){return i.config.yaxis[a]&&i.config.yaxis[a].logarithmic?t.map((function(t){return null===t?null:e.getLogVal(t,a)})):t})),i.globals.invalidLogScale?t:i.globals.seriesLog}},{key:"getLogVal",value:function(t,e){var i=this.w;return (Math.log(t)-Math.log(i.globals.minYArr[e]))/(Math.log(i.globals.maxYArr[e])-Math.log(i.globals.minYArr[e]))}},{key:"getLogYRatios",value:function(t){var e=this,i=this.w,a=this.w.globals;return a.yLogRatio=t.slice(),a.logYRange=a.yRange.map((function(t,s){if(i.config.yaxis[s]&&e.w.config.yaxis[s].logarithmic){var r,n=-Number.MAX_VALUE,o=Number.MIN_VALUE;return a.seriesLog.forEach((function(t,e){t.forEach((function(t){i.config.yaxis[e]&&i.config.yaxis[e].logarithmic&&(n=Math.max(t,n),o=Math.min(t,o));}));})),r=Math.pow(a.yRange[s],Math.abs(o-n)/a.yRange[s]),a.yLogRatio[s]=r/a.gridHeight,r}})),a.invalidLogScale?t.slice():a.yLogRatio}}],[{key:"checkComboSeries",value:function(t){var e=!1,i=0;return t.length&&void 0!==t[0].type&&(e=!0,t.forEach((function(t){"bar"!==t.type&&"column"!==t.type&&"candlestick"!==t.type||i++;}))),{comboBarCount:i,comboCharts:e}}},{key:"extendArrayProps",value:function(t,e,i){return e.yaxis&&(e=t.extendYAxis(e,i)),e.annotations&&(e.annotations.yaxis&&(e=t.extendYAxisAnnotations(e)),e.annotations.xaxis&&(e=t.extendXAxisAnnotations(e)),e.annotations.points&&(e=t.extendPointAnnotations(e))),e}}]),t}(),v=function(){function t(i){e(this,t),this.w=i.w,this.annoCtx=i;}return a(t,[{key:"addYaxisAnnotation",value:function(t,e,i){var a,s=this.w,r=t.strokeDashArray,n=this._getY1Y2("y1",t),o=t.label.text;if(null===t.y2||void 0===t.y2){var l=this.annoCtx.graphics.drawLine(0+t.offsetX,n+t.offsetY,s.globals.gridWidth+t.offsetX,n+t.offsetY,t.borderColor,r,t.borderWidth);e.appendChild(l.node),t.id&&l.node.classList.add(t.id);}else {if((a=this._getY1Y2("y2",t))>n){var h=n;n=a,a=h;}var c=this.annoCtx.graphics.drawRect(0+t.offsetX,a+t.offsetY,s.globals.gridWidth+t.offsetX,n-a,0,t.fillColor,t.opacity,1,t.borderColor,r);c.node.classList.add("apexcharts-annotation-rect"),c.attr("clip-path","url(#gridRectMask".concat(s.globals.cuid,")")),e.appendChild(c.node),t.id&&c.node.classList.add(t.id);}var d="right"===t.label.position?s.globals.gridWidth:0,g=this.annoCtx.graphics.drawText({x:d+t.label.offsetX,y:(a||n)+t.label.offsetY-3,text:o,textAnchor:t.label.textAnchor,fontSize:t.label.style.fontSize,fontFamily:t.label.style.fontFamily,fontWeight:t.label.style.fontWeight,foreColor:t.label.style.color,cssClass:"apexcharts-yaxis-annotation-label ".concat(t.label.style.cssClass," ").concat(t.id?t.id:"")});g.attr({rel:i}),e.appendChild(g.node);}},{key:"_getY1Y2",value:function(t,e){var i,a="y1"===t?e.y:e.y2,s=this.w;if(this.annoCtx.invertAxis){var r=s.globals.labels.indexOf(a);s.config.xaxis.convertedCatToNumeric&&(r=s.globals.categoryLabels.indexOf(a));var n=s.globals.dom.baseEl.querySelector(".apexcharts-yaxis-texts-g text:nth-child("+(r+1)+")");n&&(i=parseFloat(n.getAttribute("y")));}else {var o;if(s.config.yaxis[e.yAxisIndex].logarithmic)o=(a=new m(this.annoCtx.ctx).getLogVal(a,e.yAxisIndex))/s.globals.yLogRatio[e.yAxisIndex];else o=(a-s.globals.minYArr[e.yAxisIndex])/(s.globals.yRange[e.yAxisIndex]/s.globals.gridHeight);i=s.globals.gridHeight-o,s.config.yaxis[e.yAxisIndex]&&s.config.yaxis[e.yAxisIndex].reversed&&(i=o);}return i}},{key:"drawYAxisAnnotations",value:function(){var t=this,e=this.w,i=this.annoCtx.graphics.group({class:"apexcharts-yaxis-annotations"});return e.config.annotations.yaxis.map((function(e,a){t.addYaxisAnnotation(e,i.node,a);})),i}}]),t}(),y=function(){function t(i){e(this,t),this.w=i.w,this.annoCtx=i;}return a(t,[{key:"addPointAnnotation",value:function(t,e,i){var a=this.w,s=0,r=0,n=0;this.annoCtx.invertAxis&&console.warn("Point annotation is not supported in horizontal bar charts.");var o,l=parseFloat(t.y);if("string"==typeof t.x){var h=a.globals.labels.indexOf(t.x);a.config.xaxis.convertedCatToNumeric&&(h=a.globals.categoryLabels.indexOf(t.x)),s=this.annoCtx.helpers.getStringX(t.x),null===t.y&&(l=a.globals.series[t.seriesIndex][h]);}else s=(t.x-a.globals.minX)/(a.globals.xRange/a.globals.gridWidth);a.config.yaxis[t.yAxisIndex].logarithmic?o=(l=new m(this.annoCtx.ctx).getLogVal(l,t.yAxisIndex))/a.globals.yLogRatio[t.yAxisIndex]:o=(l-a.globals.minYArr[t.yAxisIndex])/(a.globals.yRange[t.yAxisIndex]/a.globals.gridHeight);if(r=a.globals.gridHeight-o-parseFloat(t.label.style.fontSize)-t.marker.size,n=a.globals.gridHeight-o,a.config.yaxis[t.yAxisIndex]&&a.config.yaxis[t.yAxisIndex].reversed&&(r=o+parseFloat(t.label.style.fontSize)+t.marker.size,n=o),g.isNumber(s)){var c={pSize:t.marker.size,pWidth:t.marker.strokeWidth,pointFillColor:t.marker.fillColor,pointStrokeColor:t.marker.strokeColor,shape:t.marker.shape,pRadius:t.marker.radius,class:"apexcharts-point-annotation-marker ".concat(t.marker.cssClass," ").concat(t.id?t.id:"")},d=this.annoCtx.graphics.drawMarker(s+t.marker.offsetX,n+t.marker.offsetY,c);e.appendChild(d.node);var u=t.label.text?t.label.text:"",f=this.annoCtx.graphics.drawText({x:s+t.label.offsetX,y:r+t.label.offsetY,text:u,textAnchor:t.label.textAnchor,fontSize:t.label.style.fontSize,fontFamily:t.label.style.fontFamily,fontWeight:t.label.style.fontWeight,foreColor:t.label.style.color,cssClass:"apexcharts-point-annotation-label ".concat(t.label.style.cssClass," ").concat(t.id?t.id:"")});if(f.attr({rel:i}),e.appendChild(f.node),t.customSVG.SVG){var p=this.annoCtx.graphics.group({class:"apexcharts-point-annotations-custom-svg "+t.customSVG.cssClass});p.attr({transform:"translate(".concat(s+t.customSVG.offsetX,", ").concat(r+t.customSVG.offsetY,")")}),p.node.innerHTML=t.customSVG.SVG,e.appendChild(p.node);}if(t.image.path){var x=t.image.width?t.image.width:20,b=t.image.height?t.image.height:20;this.annoCtx.addImage({x:s+t.image.offsetX-x/2,y:r+t.image.offsetY-b/2,width:x,height:b,path:t.image.path,appendTo:".apexcharts-point-annotations"});}}}},{key:"drawPointAnnotations",value:function(){var t=this,e=this.w,i=this.annoCtx.graphics.group({class:"apexcharts-point-annotations"});return e.config.annotations.points.map((function(e,a){t.addPointAnnotation(e,i.node,a);})),i}}]),t}();var w,k,A={name:"en",options:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],toolbar:{exportToSVG:"Download SVG",exportToPNG:"Download PNG",exportToCSV:"Download CSV",menu:"Menu",selection:"Selection",selectionZoom:"Selection Zoom",zoomIn:"Zoom In",zoomOut:"Zoom Out",pan:"Panning",reset:"Reset Zoom"}}},S=function(){function t(){e(this,t),this.yAxis={show:!0,showAlways:!1,showForNullSeries:!0,seriesName:void 0,opposite:!1,reversed:!1,logarithmic:!1,tickAmount:void 0,forceNiceScale:!1,max:void 0,min:void 0,floating:!1,decimalsInFloat:void 0,labels:{show:!0,minWidth:0,maxWidth:160,offsetX:0,offsetY:0,align:void 0,rotate:0,padding:20,style:{colors:[],fontSize:"11px",fontWeight:400,fontFamily:void 0,cssClass:""},formatter:void 0},axisBorder:{show:!1,color:"#e0e0e0",width:1,offsetX:0,offsetY:0},axisTicks:{show:!1,color:"#e0e0e0",width:6,offsetX:0,offsetY:0},title:{text:void 0,rotate:90,offsetY:0,offsetX:0,style:{color:void 0,fontSize:"11px",fontWeight:900,fontFamily:void 0,cssClass:""}},tooltip:{enabled:!1,offsetX:0},crosshairs:{show:!0,position:"front",stroke:{color:"#b6b6b6",width:1,dashArray:0}}},this.pointAnnotation={x:0,y:null,yAxisIndex:0,seriesIndex:0,marker:{size:4,fillColor:"#fff",strokeWidth:2,strokeColor:"#333",shape:"circle",offsetX:0,offsetY:0,radius:2,cssClass:""},label:{borderColor:"#c2c2c2",borderWidth:1,borderRadius:2,text:void 0,textAnchor:"middle",offsetX:0,offsetY:0,style:{background:"#fff",color:void 0,fontSize:"11px",fontFamily:void 0,fontWeight:400,cssClass:"",padding:{left:5,right:5,top:2,bottom:2}}},customSVG:{SVG:void 0,cssClass:void 0,offsetX:0,offsetY:0},image:{path:void 0,width:20,height:20,offsetX:0,offsetY:0}},this.yAxisAnnotation={y:0,y2:null,strokeDashArray:1,fillColor:"#c2c2c2",borderColor:"#c2c2c2",borderWidth:1,opacity:.3,offsetX:0,offsetY:0,yAxisIndex:0,label:{borderColor:"#c2c2c2",borderWidth:1,borderRadius:2,text:void 0,textAnchor:"end",position:"right",offsetX:0,offsetY:-3,style:{background:"#fff",color:void 0,fontSize:"11px",fontFamily:void 0,fontWeight:400,cssClass:"",padding:{left:5,right:5,top:2,bottom:2}}}},this.xAxisAnnotation={x:0,x2:null,strokeDashArray:1,fillColor:"#c2c2c2",borderColor:"#c2c2c2",borderWidth:1,opacity:.3,offsetX:0,offsetY:0,label:{borderColor:"#c2c2c2",borderWidth:1,borderRadius:2,text:void 0,textAnchor:"middle",orientation:"vertical",position:"top",offsetX:0,offsetY:0,style:{background:"#fff",color:void 0,fontSize:"11px",fontFamily:void 0,fontWeight:400,cssClass:"",padding:{left:5,right:5,top:2,bottom:2}}}},this.text={x:0,y:0,text:"",textAnchor:"start",foreColor:void 0,fontSize:"13px",fontFamily:void 0,fontWeight:400,appendTo:".apexcharts-annotations",backgroundColor:"transparent",borderColor:"#c2c2c2",borderRadius:0,borderWidth:0,paddingLeft:4,paddingRight:4,paddingTop:2,paddingBottom:2},this.shape={x:0,y:0,type:"rect",width:"100%",height:50,appendTo:".apexcharts-annotations",backgroundColor:"#fff",opacity:1,borderWidth:0,borderRadius:4,borderColor:"#c2c2c2"};}return a(t,[{key:"init",value:function(){return {annotations:{position:"front",yaxis:[this.yAxisAnnotation],xaxis:[this.xAxisAnnotation],points:[this.pointAnnotation],texts:[],images:[],shapes:[]},chart:{animations:{enabled:!0,easing:"easeinout",speed:800,animateGradually:{delay:150,enabled:!0},dynamicAnimation:{enabled:!0,speed:350}},background:"transparent",locales:[A],defaultLocale:"en",dropShadow:{enabled:!1,enabledOnSeries:void 0,top:2,left:2,blur:4,color:"#000",opacity:.35},events:{animationEnd:void 0,beforeMount:void 0,mounted:void 0,updated:void 0,click:void 0,mouseMove:void 0,legendClick:void 0,markerClick:void 0,selection:void 0,dataPointSelection:void 0,dataPointMouseEnter:void 0,dataPointMouseLeave:void 0,beforeZoom:void 0,zoomed:void 0,scrolled:void 0},foreColor:"#373d3f",fontFamily:"Helvetica, Arial, sans-serif",height:"auto",parentHeightOffset:15,redrawOnParentResize:!0,id:void 0,group:void 0,offsetX:0,offsetY:0,selection:{enabled:!1,type:"x",fill:{color:"#24292e",opacity:.1},stroke:{width:1,color:"#24292e",opacity:.4,dashArray:3},xaxis:{min:void 0,max:void 0},yaxis:{min:void 0,max:void 0}},sparkline:{enabled:!1},brush:{enabled:!1,autoScaleYaxis:!0,target:void 0},stacked:!1,stackType:"normal",toolbar:{show:!0,offsetX:0,offsetY:0,tools:{download:!0,selection:!0,zoom:!0,zoomin:!0,zoomout:!0,pan:!0,reset:!0,customIcons:[]},autoSelected:"zoom"},type:"line",width:"100%",zoom:{enabled:!0,type:"x",autoScaleYaxis:!1,zoomedArea:{fill:{color:"#90CAF9",opacity:.4},stroke:{color:"#0D47A1",opacity:.4,width:1}}}},plotOptions:{bar:{horizontal:!1,columnWidth:"70%",barHeight:"70%",distributed:!1,startingShape:"flat",endingShape:"flat",rangeBarOverlap:!0,colors:{ranges:[],backgroundBarColors:[],backgroundBarOpacity:1,backgroundBarRadius:0},dataLabels:{position:"top",maxItems:100,hideOverflowingLabels:!0,orientation:"horizontal"}},bubble:{minBubbleRadius:void 0,maxBubbleRadius:void 0},candlestick:{colors:{upward:"#00B746",downward:"#EF403C"},wick:{useFillColor:!0}},heatmap:{radius:2,enableShades:!0,shadeIntensity:.5,reverseNegativeShade:!1,distributed:!1,useFillColorAsStroke:!1,colorScale:{inverse:!1,ranges:[],min:void 0,max:void 0}},radialBar:{inverseOrder:!1,startAngle:0,endAngle:360,offsetX:0,offsetY:0,hollow:{margin:5,size:"50%",background:"transparent",image:void 0,imageWidth:150,imageHeight:150,imageOffsetX:0,imageOffsetY:0,imageClipped:!0,position:"front",dropShadow:{enabled:!1,top:0,left:0,blur:3,color:"#000",opacity:.5}},track:{show:!0,startAngle:void 0,endAngle:void 0,background:"#f2f2f2",strokeWidth:"97%",opacity:1,margin:5,dropShadow:{enabled:!1,top:0,left:0,blur:3,color:"#000",opacity:.5}},dataLabels:{show:!0,name:{show:!0,fontSize:"16px",fontFamily:void 0,fontWeight:600,color:void 0,offsetY:0,formatter:function(t){return t}},value:{show:!0,fontSize:"14px",fontFamily:void 0,fontWeight:400,color:void 0,offsetY:16,formatter:function(t){return t+"%"}},total:{show:!1,label:"Total",fontSize:"16px",fontWeight:600,fontFamily:void 0,color:void 0,formatter:function(t){return t.globals.seriesTotals.reduce((function(t,e){return t+e}),0)/t.globals.series.length+"%"}}}},pie:{customScale:1,offsetX:0,offsetY:0,startAngle:0,expandOnClick:!0,dataLabels:{offset:0,minAngleToShowLabel:10},donut:{size:"65%",background:"transparent",labels:{show:!1,name:{show:!0,fontSize:"16px",fontFamily:void 0,fontWeight:600,color:void 0,offsetY:-10,formatter:function(t){return t}},value:{show:!0,fontSize:"20px",fontFamily:void 0,fontWeight:400,color:void 0,offsetY:10,formatter:function(t){return t}},total:{show:!1,showAlways:!1,label:"Total",fontSize:"16px",fontWeight:400,fontFamily:void 0,color:void 0,formatter:function(t){return t.globals.seriesTotals.reduce((function(t,e){return t+e}),0)}}}}},polarArea:{rings:{strokeWidth:1,strokeColor:"#e8e8e8"}},radar:{size:void 0,offsetX:0,offsetY:0,polygons:{strokeWidth:1,strokeColors:"#e8e8e8",connectorColors:"#e8e8e8",fill:{colors:void 0}}}},colors:void 0,dataLabels:{enabled:!0,enabledOnSeries:void 0,formatter:function(t){return null!==t?t:""},textAnchor:"middle",distributed:!1,offsetX:0,offsetY:0,style:{fontSize:"12px",fontFamily:void 0,fontWeight:600,colors:void 0},background:{enabled:!0,foreColor:"#fff",borderRadius:2,padding:4,opacity:.9,borderWidth:1,borderColor:"#fff",dropShadow:{enabled:!1,top:1,left:1,blur:1,color:"#000",opacity:.45}},dropShadow:{enabled:!1,top:1,left:1,blur:1,color:"#000",opacity:.45}},fill:{type:"solid",colors:void 0,opacity:.85,gradient:{shade:"dark",type:"horizontal",shadeIntensity:.5,gradientToColors:void 0,inverseColors:!0,opacityFrom:1,opacityTo:1,stops:[0,50,100],colorStops:[]},image:{src:[],width:void 0,height:void 0},pattern:{style:"squares",width:6,height:6,strokeWidth:2}},grid:{show:!0,borderColor:"#e0e0e0",strokeDashArray:0,position:"back",xaxis:{lines:{show:!1}},yaxis:{lines:{show:!0}},row:{colors:void 0,opacity:.5},column:{colors:void 0,opacity:.5},padding:{top:0,right:10,bottom:0,left:12}},labels:[],legend:{show:!0,showForSingleSeries:!1,showForNullSeries:!0,showForZeroSeries:!0,floating:!1,position:"bottom",horizontalAlign:"center",inverseOrder:!1,fontSize:"12px",fontFamily:void 0,fontWeight:400,width:void 0,height:void 0,formatter:void 0,tooltipHoverFormatter:void 0,offsetX:-20,offsetY:4,labels:{colors:void 0,useSeriesColors:!1},markers:{width:12,height:12,strokeWidth:0,fillColors:void 0,strokeColor:"#fff",radius:12,customHTML:void 0,offsetX:0,offsetY:0,onClick:void 0},itemMargin:{horizontal:5,vertical:2},onItemClick:{toggleDataSeries:!0},onItemHover:{highlightDataSeries:!0}},markers:{discrete:[],size:0,colors:void 0,strokeColors:"#fff",strokeWidth:2,strokeOpacity:.9,strokeDashArray:0,fillOpacity:1,shape:"circle",radius:2,offsetX:0,offsetY:0,onClick:void 0,onDblClick:void 0,showNullDataPoints:!0,hover:{size:void 0,sizeOffset:3}},noData:{text:void 0,align:"center",verticalAlign:"middle",offsetX:0,offsetY:0,style:{color:void 0,fontSize:"14px",fontFamily:void 0}},responsive:[],series:void 0,states:{normal:{filter:{type:"none",value:0}},hover:{filter:{type:"lighten",value:.15}},active:{allowMultipleDataPointsSelection:!1,filter:{type:"darken",value:.65}}},title:{text:void 0,align:"left",margin:5,offsetX:0,offsetY:0,floating:!1,style:{fontSize:"14px",fontWeight:900,fontFamily:void 0,color:void 0}},subtitle:{text:void 0,align:"left",margin:5,offsetX:0,offsetY:30,floating:!1,style:{fontSize:"12px",fontWeight:400,fontFamily:void 0,color:void 0}},stroke:{show:!0,curve:"smooth",lineCap:"butt",width:2,colors:void 0,dashArray:0},tooltip:{enabled:!0,enabledOnSeries:void 0,shared:!0,followCursor:!1,intersect:!1,inverseOrder:!1,custom:void 0,fillSeriesColor:!1,theme:"light",style:{fontSize:"12px",fontFamily:void 0},onDatasetHover:{highlightDataSeries:!1},x:{show:!0,format:"dd MMM",formatter:void 0},y:{formatter:void 0,title:{formatter:function(t){return t}}},z:{formatter:void 0,title:"Size: "},marker:{show:!0,fillColors:void 0},items:{display:"flex"},fixed:{enabled:!1,position:"topRight",offsetX:0,offsetY:0}},xaxis:{type:"category",categories:[],convertedCatToNumeric:!1,sorted:!1,offsetX:0,offsetY:0,labels:{show:!0,rotate:-45,rotateAlways:!1,hideOverlappingLabels:!0,trim:!1,minHeight:void 0,maxHeight:120,showDuplicates:!0,style:{colors:[],fontSize:"12px",fontWeight:400,fontFamily:void 0,cssClass:""},offsetX:0,offsetY:0,format:void 0,formatter:void 0,datetimeUTC:!0,datetimeFormatter:{year:"yyyy",month:"MMM 'yy",day:"dd MMM",hour:"HH:mm",minute:"HH:mm:ss"}},axisBorder:{show:!0,color:"#e0e0e0",width:"100%",height:1,offsetX:0,offsetY:0},axisTicks:{show:!0,color:"#e0e0e0",height:6,offsetX:0,offsetY:0},tickAmount:void 0,tickPlacement:"on",min:void 0,max:void 0,range:void 0,floating:!1,position:"bottom",title:{text:void 0,offsetX:0,offsetY:0,style:{color:void 0,fontSize:"12px",fontWeight:900,fontFamily:void 0,cssClass:""}},crosshairs:{show:!0,width:1,position:"back",opacity:.9,stroke:{color:"#b6b6b6",width:1,dashArray:3},fill:{type:"solid",color:"#B1B9C4",gradient:{colorFrom:"#D8E3F0",colorTo:"#BED1E6",stops:[0,100],opacityFrom:.4,opacityTo:.5}},dropShadow:{enabled:!1,left:0,top:0,blur:1,opacity:.4}},tooltip:{enabled:!0,offsetY:0,formatter:void 0,style:{fontSize:"12px",fontFamily:void 0}}},yaxis:this.yAxis,theme:{mode:"light",palette:"palette1",monochrome:{enabled:!1,color:"#008FFB",shadeTo:"light",shadeIntensity:.65}}}}}]),t}(),C=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.graphics=new p(this.ctx),this.w.globals.isBarHorizontal&&(this.invertAxis=!0),this.helpers=new x(this),this.xAxisAnnotations=new b(this),this.yAxisAnnotations=new v(this),this.pointsAnnotations=new y(this),this.w.globals.isBarHorizontal&&this.w.config.yaxis[0].reversed&&(this.inversedReversedAxis=!0),this.xDivision=this.w.globals.gridWidth/this.w.globals.dataPoints;}return a(t,[{key:"drawAxesAnnotations",value:function(){var t=this.w;if(t.globals.axisCharts){for(var e=this.yAxisAnnotations.drawYAxisAnnotations(),i=this.xAxisAnnotations.drawXAxisAnnotations(),a=this.pointsAnnotations.drawPointAnnotations(),s=t.config.chart.animations.enabled,r=[e,i,a],n=[i.node,e.node,a.node],o=0;o<3;o++)t.globals.dom.elGraphical.add(r[o]),!s||t.globals.resized||t.globals.dataChanged||"scatter"!==t.config.chart.type&&"bubble"!==t.config.chart.type&&t.globals.dataPoints>1&&n[o].classList.add("apexcharts-element-hidden"),t.globals.delayedElements.push({el:n[o],index:0});this.helpers.annotationsBackground();}}},{key:"drawShapeAnnos",value:function(){var t=this;this.w.config.annotations.shapes.map((function(e,i){t.addShape(e,i);}));}},{key:"drawImageAnnos",value:function(){var t=this;this.w.config.annotations.images.map((function(e,i){t.addImage(e,i);}));}},{key:"drawTextAnnos",value:function(){var t=this;this.w.config.annotations.texts.map((function(e,i){t.addText(e,i);}));}},{key:"addXaxisAnnotation",value:function(t,e,i){this.xAxisAnnotations.addXaxisAnnotation(t,e,i);}},{key:"addYaxisAnnotation",value:function(t,e,i){this.yAxisAnnotations.addYaxisAnnotation(t,e,i);}},{key:"addPointAnnotation",value:function(t,e,i){this.pointsAnnotations.addPointAnnotation(t,e,i);}},{key:"addText",value:function(t,e){var i=t.x,a=t.y,s=t.text,r=t.textAnchor,n=t.foreColor,o=t.fontSize,l=t.fontFamily,h=t.fontWeight,c=t.cssClass,d=t.backgroundColor,g=t.borderWidth,u=t.strokeDashArray,f=t.borderRadius,p=t.borderColor,x=t.appendTo,b=void 0===x?".apexcharts-annotations":x,m=t.paddingLeft,v=void 0===m?4:m,y=t.paddingRight,w=void 0===y?4:y,k=t.paddingBottom,A=void 0===k?2:k,S=t.paddingTop,C=void 0===S?2:S,L=this.w,P=this.graphics.drawText({x:i,y:a,text:s,textAnchor:r||"start",fontSize:o||"12px",fontWeight:h||"regular",fontFamily:l||L.config.chart.fontFamily,foreColor:n||L.config.chart.foreColor,cssClass:c}),T=L.globals.dom.baseEl.querySelector(b);T&&T.appendChild(P.node);var z=P.bbox();if(t.draggable&&this.helpers.makeAnnotationDraggable(P,"texts",e),s){var I=this.graphics.drawRect(z.x-v,z.y-C,z.width+v+w,z.height+A+C,f,d||"transparent",1,g,p,u);T.insertBefore(I.node,P.node);}}},{key:"addShape",value:function(t,e){var i={type:t.type,x:t.x||0,y:t.y||0,width:t.width||"100%",height:t.height||50,circleRadius:t.radius||25,backgroundColor:t.backgroundColor||"#fff",opacity:t.opacity||1,borderWidth:t.borderWidth||0,borderRadius:t.borderRadius||4,borderColor:t.borderColor||"#c2c2c2",appendTo:t.appendTo||".apexcharts-annotations"},a=this.w;String(i.width).indexOf("%")>-1&&(i.width=parseInt(i.width,10)*parseInt(a.globals.svgWidth,10)/100);var s=null;s="circle"===i.type?this.graphics.drawCircle(i.circleRadius,{fill:i.backgroundColor,stroke:i.borderColor,"stroke-width":i.borderWidth,opacity:i.opacity,cx:i.x,cy:i.y}):this.graphics.drawRect(i.x,i.y,i.width,i.height,i.borderRadius,i.backgroundColor,i.opacity,i.borderWidth,i.borderColor);var r=a.globals.dom.baseEl.querySelector(i.appendTo);r&&r.appendChild(s.node),t.draggable&&(this.helpers.makeAnnotationDraggable(s,"shapes",e),s.node.classList.add("apexcharts-resizable-element"));}},{key:"addImage",value:function(t,e){var i=this.w,a=t.path,s=t.x,r=void 0===s?0:s,n=t.y,o=void 0===n?0:n,l=t.width,h=void 0===l?20:l,c=t.height,d=void 0===c?20:c,g=t.appendTo,u=void 0===g?".apexcharts-annotations":g,f=i.globals.dom.Paper.image(a);f.size(h,d).move(r,o);var p=i.globals.dom.baseEl.querySelector(u);p&&p.appendChild(f.node),t.draggable&&(this.helpers.makeAnnotationDraggable(f,"images",e),f.node.classList.add("apexcharts-resizable-element"));}},{key:"addXaxisAnnotationExternal",value:function(t,e,i){return this.addAnnotationExternal({params:t,pushToMemory:e,context:i,type:"xaxis",contextMethod:i.addXaxisAnnotation}),i}},{key:"addYaxisAnnotationExternal",value:function(t,e,i){return this.addAnnotationExternal({params:t,pushToMemory:e,context:i,type:"yaxis",contextMethod:i.addYaxisAnnotation}),i}},{key:"addPointAnnotationExternal",value:function(t,e,i){return void 0===this.invertAxis&&(this.invertAxis=i.w.globals.isBarHorizontal),this.addAnnotationExternal({params:t,pushToMemory:e,context:i,type:"point",contextMethod:i.addPointAnnotation}),i}},{key:"addAnnotationExternal",value:function(t){var e=t.params,i=t.pushToMemory,a=t.context,s=t.type,r=t.contextMethod,n=a,o=n.w,l=o.globals.dom.baseEl.querySelector(".apexcharts-".concat(s,"-annotations")),h=l.childNodes.length+1,c=new S,d=Object.assign({},"xaxis"===s?c.xAxisAnnotation:"yaxis"===s?c.yAxisAnnotation:c.pointAnnotation),u=g.extend(d,e);switch(s){case"xaxis":this.addXaxisAnnotation(u,l,h);break;case"yaxis":this.addYaxisAnnotation(u,l,h);break;case"point":this.addPointAnnotation(u,l,h);}var f=o.globals.dom.baseEl.querySelector(".apexcharts-".concat(s,"-annotations .apexcharts-").concat(s,"-annotation-label[rel='").concat(h,"']")),p=this.helpers.addBackgroundToAnno(f,u);return p&&l.insertBefore(p.node,f),i&&o.globals.memory.methodsToExec.push({context:n,id:u.id?u.id:g.randomId(),method:r,label:"addAnnotation",params:e}),a}},{key:"clearAnnotations",value:function(t){var e=t.w,i=e.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxis-annotations, .apexcharts-xaxis-annotations, .apexcharts-point-annotations");e.globals.memory.methodsToExec.map((function(t,i){"addText"!==t.label&&"addAnnotation"!==t.label||e.globals.memory.methodsToExec.splice(i,1);})),i=g.listToArray(i),Array.prototype.forEach.call(i,(function(t){for(;t.firstChild;)t.removeChild(t.firstChild);}));}},{key:"removeAnnotation",value:function(t,e){var i=t.w,a=i.globals.dom.baseEl.querySelectorAll(".".concat(e));a&&(i.globals.memory.methodsToExec.map((function(t,a){t.id===e&&i.globals.memory.methodsToExec.splice(a,1);})),Array.prototype.forEach.call(a,(function(t){t.parentElement.removeChild(t);})));}}]),t}(),L=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.opts=null,this.seriesIndex=0;}return a(t,[{key:"clippedImgArea",value:function(t){var e=this.w,i=e.config,a=parseInt(e.globals.gridWidth,10),s=parseInt(e.globals.gridHeight,10),r=a>s?a:s,n=t.image,o=0,l=0;void 0===t.width&&void 0===t.height?void 0!==i.fill.image.width&&void 0!==i.fill.image.height?(o=i.fill.image.width+1,l=i.fill.image.height):(o=r+1,l=r):(o=t.width,l=t.height);var h=document.createElementNS(e.globals.SVGNS,"pattern");p.setAttrs(h,{id:t.patternID,patternUnits:t.patternUnits?t.patternUnits:"userSpaceOnUse",width:o+"px",height:l+"px"});var c=document.createElementNS(e.globals.SVGNS,"image");h.appendChild(c),c.setAttributeNS(window.SVG.xlink,"href",n),p.setAttrs(c,{x:0,y:0,preserveAspectRatio:"none",width:o+"px",height:l+"px"}),c.style.opacity=t.opacity,e.globals.dom.elDefs.node.appendChild(h);}},{key:"getSeriesIndex",value:function(t){var e=this.w;return ("bar"===e.config.chart.type||"rangeBar"===e.config.chart.type)&&e.config.plotOptions.bar.distributed||"heatmap"===e.config.chart.type?this.seriesIndex=t.seriesNumber:this.seriesIndex=t.seriesNumber%e.globals.series.length,this.seriesIndex}},{key:"fillPath",value:function(t){var e=this.w;this.opts=t;var i,a,s,r=this.w.config;this.seriesIndex=this.getSeriesIndex(t);var n=this.getFillColors()[this.seriesIndex];"function"==typeof n&&(n=n({seriesIndex:this.seriesIndex,dataPointIndex:t.dataPointIndex,value:t.value,w:e}));var o=this.getFillType(this.seriesIndex),l=Array.isArray(r.fill.opacity)?r.fill.opacity[this.seriesIndex]:r.fill.opacity,h=n;if(t.color&&(n=t.color),-1===n.indexOf("rgb")?n.length<9&&(h=g.hexToRgba(n,l)):n.indexOf("rgba")>-1&&(l=g.getOpacityFromRGBA(n)),t.opacity&&(l=t.opacity),"pattern"===o&&(a=this.handlePatternFill(a,n,l,h)),"gradient"===o&&(s=this.handleGradientFill(n,l,this.seriesIndex)),"image"===o){var c=r.fill.image.src,d=t.patternID?t.patternID:"";this.clippedImgArea({opacity:l,image:Array.isArray(c)?t.seriesNumber<c.length?c[t.seriesNumber]:c[0]:c,width:t.width?t.width:void 0,height:t.height?t.height:void 0,patternUnits:t.patternUnits,patternID:"pattern".concat(e.globals.cuid).concat(t.seriesNumber+1).concat(d)}),i="url(#pattern".concat(e.globals.cuid).concat(t.seriesNumber+1).concat(d,")");}else i="gradient"===o?s:"pattern"===o?a:h;return t.solid&&(i=h),i}},{key:"getFillType",value:function(t){var e=this.w;return Array.isArray(e.config.fill.type)?e.config.fill.type[t]:e.config.fill.type}},{key:"getFillColors",value:function(){var t=this.w,e=t.config,i=this.opts,a=[];return t.globals.comboCharts?"line"===t.config.series[this.seriesIndex].type?t.globals.stroke.colors instanceof Array?a=t.globals.stroke.colors:a.push(t.globals.stroke.colors):t.globals.fill.colors instanceof Array?a=t.globals.fill.colors:a.push(t.globals.fill.colors):"line"===e.chart.type?t.globals.stroke.colors instanceof Array?a=t.globals.stroke.colors:a.push(t.globals.stroke.colors):t.globals.fill.colors instanceof Array?a=t.globals.fill.colors:a.push(t.globals.fill.colors),void 0!==i.fillColors&&(a=[],i.fillColors instanceof Array?a=i.fillColors.slice():a.push(i.fillColors)),a}},{key:"handlePatternFill",value:function(t,e,i,a){var s=this.w.config,r=this.opts,n=new p(this.ctx),o=void 0===s.fill.pattern.strokeWidth?Array.isArray(s.stroke.width)?s.stroke.width[this.seriesIndex]:s.stroke.width:Array.isArray(s.fill.pattern.strokeWidth)?s.fill.pattern.strokeWidth[this.seriesIndex]:s.fill.pattern.strokeWidth,l=e;s.fill.pattern.style instanceof Array?t=void 0!==s.fill.pattern.style[r.seriesNumber]?n.drawPattern(s.fill.pattern.style[r.seriesNumber],s.fill.pattern.width,s.fill.pattern.height,l,o,i):a:t=n.drawPattern(s.fill.pattern.style,s.fill.pattern.width,s.fill.pattern.height,l,o,i);return t}},{key:"handleGradientFill",value:function(t,e,i){var a,s=this.w.config,r=this.opts,n=new p(this.ctx),o=new g,l=s.fill.gradient.type,h=t,c=void 0===s.fill.gradient.opacityFrom?e:Array.isArray(s.fill.gradient.opacityFrom)?s.fill.gradient.opacityFrom[i]:s.fill.gradient.opacityFrom;h.indexOf("rgba")>-1&&(c=g.getOpacityFromRGBA(h));var d=void 0===s.fill.gradient.opacityTo?e:Array.isArray(s.fill.gradient.opacityTo)?s.fill.gradient.opacityTo[i]:s.fill.gradient.opacityTo;if(void 0===s.fill.gradient.gradientToColors||0===s.fill.gradient.gradientToColors.length)a="dark"===s.fill.gradient.shade?o.shadeColor(-1*parseFloat(s.fill.gradient.shadeIntensity),t.indexOf("rgb")>-1?g.rgb2hex(t):t):o.shadeColor(parseFloat(s.fill.gradient.shadeIntensity),t.indexOf("rgb")>-1?g.rgb2hex(t):t);else {var u=s.fill.gradient.gradientToColors[r.seriesNumber];a=u,u.indexOf("rgba")>-1&&(d=g.getOpacityFromRGBA(u));}if(s.fill.gradient.inverseColors){var f=h;h=a,a=f;}return h.indexOf("rgb")>-1&&(h=g.rgb2hex(h)),a.indexOf("rgb")>-1&&(a=g.rgb2hex(a)),n.drawGradient(l,h,a,c,d,r.size,s.fill.gradient.stops,s.fill.gradient.colorStops,i)}}]),t}(),P=function(){function t(i,a){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"setGlobalMarkerSize",value:function(){var t=this.w;if(t.globals.markers.size=Array.isArray(t.config.markers.size)?t.config.markers.size:[t.config.markers.size],t.globals.markers.size.length>0){if(t.globals.markers.size.length<t.globals.series.length+1)for(var e=0;e<=t.globals.series.length;e++)void 0===t.globals.markers.size[e]&&t.globals.markers.size.push(t.globals.markers.size[0]);}else t.globals.markers.size=t.config.series.map((function(e){return t.config.markers.size}));}},{key:"plotChartMarkers",value:function(t,e,i,a){var s,r=arguments.length>4&&void 0!==arguments[4]&&arguments[4],n=this.w,o=e,l=t,h=null,c=new p(this.ctx);if((n.globals.markers.size[e]>0||r)&&(h=c.group({class:r?"":"apexcharts-series-markers"})).attr("clip-path","url(#gridRectMarkerMask".concat(n.globals.cuid,")")),l.x instanceof Array)for(var d=0;d<l.x.length;d++){var f=i;1===i&&0===d&&(f=0),1===i&&1===d&&(f=1);var x="apexcharts-marker";"line"!==n.config.chart.type&&"area"!==n.config.chart.type||n.globals.comboCharts||n.config.tooltip.intersect||(x+=" no-pointer-events");var b=Array.isArray(n.config.markers.size)?n.globals.markers.size[e]>0:n.config.markers.size>0;if(b||r){g.isNumber(l.y[d])?x+=" w".concat(g.randomId()):x="apexcharts-nullpoint";var m=this.getMarkerConfig(x,e,f);n.config.series[o].data[i]&&(n.config.series[o].data[i].fillColor&&(m.pointFillColor=n.config.series[o].data[i].fillColor),n.config.series[o].data[i].strokeColor&&(m.pointStrokeColor=n.config.series[o].data[i].strokeColor)),a&&(m.pSize=a),(s=c.drawMarker(l.x[d],l.y[d],m)).attr("rel",f),s.attr("j",f),s.attr("index",e),s.node.setAttribute("default-marker-size",m.pSize);var v=new u(this.ctx);v.setSelectionFilter(s,e,f),this.addEvents(s),h&&h.add(s);}else void 0===n.globals.pointsArray[e]&&(n.globals.pointsArray[e]=[]),n.globals.pointsArray[e].push([l.x[d],l.y[d]]);}return h}},{key:"getMarkerConfig",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=this.w,s=this.getMarkerStyle(e),r=a.globals.markers.size[e],n=a.config.markers;return null!==i&&n.discrete.length&&n.discrete.map((function(t){t.seriesIndex===e&&t.dataPointIndex===i&&(s.pointStrokeColor=t.strokeColor,s.pointFillColor=t.fillColor,r=t.size);})),{pSize:r,pRadius:n.radius,pWidth:n.strokeWidth instanceof Array?n.strokeWidth[e]:n.strokeWidth,pointStrokeColor:s.pointStrokeColor,pointFillColor:s.pointFillColor,shape:n.shape instanceof Array?n.shape[e]:n.shape,class:t,pointStrokeOpacity:n.strokeOpacity instanceof Array?n.strokeOpacity[e]:n.strokeOpacity,pointStrokeDashArray:n.strokeDashArray instanceof Array?n.strokeDashArray[e]:n.strokeDashArray,pointFillOpacity:n.fillOpacity instanceof Array?n.fillOpacity[e]:n.fillOpacity,seriesIndex:e}}},{key:"addEvents",value:function(t){var e=this.w,i=new p(this.ctx);t.node.addEventListener("mouseenter",i.pathMouseEnter.bind(this.ctx,t)),t.node.addEventListener("mouseleave",i.pathMouseLeave.bind(this.ctx,t)),t.node.addEventListener("mousedown",i.pathMouseDown.bind(this.ctx,t)),t.node.addEventListener("click",e.config.markers.onClick),t.node.addEventListener("dblclick",e.config.markers.onDblClick),t.node.addEventListener("touchstart",i.pathMouseDown.bind(this.ctx,t),{passive:!0});}},{key:"getMarkerStyle",value:function(t){var e=this.w,i=e.globals.markers.colors,a=e.config.markers.strokeColor||e.config.markers.strokeColors;return {pointStrokeColor:a instanceof Array?a[t]:a,pointFillColor:i instanceof Array?i[t]:i}}}]),t}(),T=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.initialAnim=this.w.config.chart.animations.enabled,this.dynamicAnim=this.initialAnim&&this.w.config.chart.animations.dynamicAnimation.enabled;}return a(t,[{key:"draw",value:function(t,e,i){var a=this.w,s=new p(this.ctx),r=i.realIndex,n=i.pointsPos,o=i.zRatio,l=i.elParent,h=s.group({class:"apexcharts-series-markers apexcharts-series-".concat(a.config.chart.type)});if(h.attr("clip-path","url(#gridRectMarkerMask".concat(a.globals.cuid,")")),n.x instanceof Array)for(var c=0;c<n.x.length;c++){var d=e+1,g=!0;0===e&&0===c&&(d=0),0===e&&1===c&&(d=1);var u=0,f=a.globals.markers.size[r];if(o!==1/0){f=a.globals.seriesZ[r][d]/o;var x=a.config.plotOptions.bubble;x.minBubbleRadius&&f<x.minBubbleRadius&&(f=x.minBubbleRadius),x.maxBubbleRadius&&f>x.maxBubbleRadius&&(f=x.maxBubbleRadius);}a.config.chart.animations.enabled||(u=f);var b=n.x[c],m=n.y[c];if(u=u||0,null!==m&&void 0!==a.globals.series[r][d]||(g=!1),g){var v=this.drawPoint(b,m,u,f,r,d,e);h.add(v);}l.add(h);}}},{key:"drawPoint",value:function(t,e,i,a,s,r,n){var o=this.w,l=s,h=new f(this.ctx),c=new u(this.ctx),d=new L(this.ctx),g=new P(this.ctx),x=new p(this.ctx),b=g.getMarkerConfig("apexcharts-marker",l),m=d.fillPath({seriesNumber:s,dataPointIndex:r,patternUnits:"objectBoundingBox",value:o.globals.series[s][n]}),v=x.drawCircle(i);if(o.config.series[l].data[r]&&o.config.series[l].data[r].fillColor&&(m=o.config.series[l].data[r].fillColor),v.attr({cx:t,cy:e,fill:m,stroke:b.pointStrokeColor,"stroke-width":b.pWidth,"stroke-dasharray":b.pointStrokeDashArray,"stroke-opacity":b.pointStrokeOpacity}),o.config.chart.dropShadow.enabled){var y=o.config.chart.dropShadow;c.dropShadow(v,y,s);}if(this.initialAnim&&!o.globals.dataChanged){var w=1;o.globals.resized||(w=o.config.chart.animations.speed),h.animateCircleRadius(v,0,a,w,o.globals.easing,(function(){window.setTimeout((function(){h.animationCompleted(v);}),100);}));}if(o.globals.dataChanged)if(this.dynamicAnim){var k,A,S,C,T=o.config.chart.animations.dynamicAnimation.speed;null!=(C=o.globals.previousPaths[s]&&o.globals.previousPaths[s][n])&&(k=C.x,A=C.y,S=void 0!==C.r?C.r:a);for(var z=0;z<o.globals.collapsedSeries.length;z++)o.globals.collapsedSeries[z].index===s&&(T=1,a=0);0===t&&0===e&&(a=0),h.animateCircle(v,{cx:k,cy:A,r:S},{cx:t,cy:e,r:a},T,o.globals.easing);}else v.attr({r:a});return v.attr({rel:r,j:r,index:s,"default-marker-size":a}),c.setSelectionFilter(v,s,r),g.addEvents(v),v.node.classList.add("apexcharts-marker"),v}},{key:"centerTextInBubble",value:function(t){var e=this.w;return {y:t+=parseInt(e.config.dataLabels.style.fontSize,10)/4}}}]),t}(),z=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"dataLabelsCorrection",value:function(t,e,i,a,s,r,n){var o=this.w,l=!1,h=new p(this.ctx).getTextRects(i,n),c=h.width,d=h.height;void 0===o.globals.dataLabelsRects[a]&&(o.globals.dataLabelsRects[a]=[]),o.globals.dataLabelsRects[a].push({x:t,y:e,width:c,height:d});var g=o.globals.dataLabelsRects[a].length-2,u=void 0!==o.globals.lastDrawnDataLabelsIndexes[a]?o.globals.lastDrawnDataLabelsIndexes[a][o.globals.lastDrawnDataLabelsIndexes[a].length-1]:0;if(void 0!==o.globals.dataLabelsRects[a][g]){var f=o.globals.dataLabelsRects[a][u];(t>f.x+f.width+2||e>f.y+f.height+2||t+c<f.x)&&(l=!0);}return (0===s||r)&&(l=!0),{x:t,y:e,textRects:h,drawnextLabel:l}}},{key:"drawDataLabel",value:function(t,e,i){var a=this,s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:2,r=this.w,n=new p(this.ctx),o=r.config.dataLabels,l=0,h=0,c=i,d=null;if(!o.enabled||t.x instanceof Array!=!0)return d;d=n.group({class:"apexcharts-data-labels"});for(var g=0;g<t.x.length;g++)if(l=t.x[g]+o.offsetX,h=t.y[g]+o.offsetY+s,!isNaN(l)){1===i&&0===g&&(c=0),1===i&&1===g&&(c=1);var u=r.globals.series[e][c],f="",x=function(t){return r.config.dataLabels.formatter(t,{ctx:a.ctx,seriesIndex:e,dataPointIndex:c,w:r})};if("bubble"===r.config.chart.type){f=x(u=r.globals.seriesZ[e][c]),h=t.y[g];var b=new T(this.ctx),m=b.centerTextInBubble(h,e,c);h=m.y;}else void 0!==u&&(f=x(u));this.plotDataLabelsText({x:l,y:h,text:f,i:e,j:c,parent:d,offsetCorrection:!0,dataLabelsConfig:r.config.dataLabels});}return d}},{key:"plotDataLabelsText",value:function(t){var e=this.w,i=new p(this.ctx),a=t.x,s=t.y,r=t.i,n=t.j,o=t.text,l=t.textAnchor,h=t.parent,c=t.dataLabelsConfig,d=t.color,g=t.alwaysDrawDataLabel,f=t.offsetCorrection;if(!(Array.isArray(e.config.dataLabels.enabledOnSeries)&&e.config.dataLabels.enabledOnSeries.indexOf(r)<0)){var x={x:a,y:s,drawnextLabel:!0};f&&(x=this.dataLabelsCorrection(a,s,o,r,n,g,parseInt(c.style.fontSize,10))),e.globals.zoomed||(a=x.x,s=x.y),x.textRects&&(a+x.textRects.width<-20||a>e.globals.gridWidth+20)&&(o="");var b=e.globals.dataLabels.style.colors[r];(("bar"===e.config.chart.type||"rangeBar"===e.config.chart.type)&&e.config.plotOptions.bar.distributed||e.config.dataLabels.distributed)&&(b=e.globals.dataLabels.style.colors[n]),d&&(b=d);var m=c.offsetX,v=c.offsetY;if("bar"!==e.config.chart.type&&"rangeBar"!==e.config.chart.type||(m=0,v=0),x.drawnextLabel){var y=i.drawText({width:100,height:parseInt(c.style.fontSize,10),x:a+m,y:s+v,foreColor:b,textAnchor:l||c.textAnchor,text:o,fontSize:c.style.fontSize,fontFamily:c.style.fontFamily,fontWeight:c.style.fontWeight||"normal"});if(y.attr({class:"apexcharts-datalabel",cx:a,cy:s}),c.dropShadow.enabled){var w=c.dropShadow;new u(this.ctx).dropShadow(y,w);}h.add(y),void 0===e.globals.lastDrawnDataLabelsIndexes[r]&&(e.globals.lastDrawnDataLabelsIndexes[r]=[]),e.globals.lastDrawnDataLabelsIndexes[r].push(n);}}}},{key:"addBackgroundToDataLabel",value:function(t,e){var i=this.w,a=i.config.dataLabels.background,s=a.padding,r=a.padding/2,n=e.width,o=e.height,l=new p(this.ctx).drawRect(e.x-s,e.y-r/2,n+2*s,o+r,a.borderRadius,"transparent"===i.config.chart.background?"#fff":i.config.chart.background,a.opacity,a.borderWidth,a.borderColor);a.dropShadow.enabled&&new u(this.ctx).dropShadow(l,a.dropShadow);return l}},{key:"dataLabelsBackground",value:function(){var t=this.w;if("bubble"!==t.config.chart.type)for(var e=t.globals.dom.baseEl.querySelectorAll(".apexcharts-datalabels text"),i=0;i<e.length;i++){var a=e[i],s=a.getBBox(),r=null;if(s.width&&s.height&&(r=this.addBackgroundToDataLabel(a,s)),r){a.parentNode.insertBefore(r.node,a);var n=a.getAttribute("fill");t.config.chart.animations.enabled&&!t.globals.resized&&!t.globals.dataChanged?r.animate().attr({fill:n}):r.attr({fill:n}),a.setAttribute("fill",t.config.dataLabels.background.foreColor);}}}},{key:"bringForward",value:function(){for(var t=this.w,e=t.globals.dom.baseEl.getElementsByClassName("apexcharts-datalabels"),i=t.globals.dom.baseEl.querySelector(".apexcharts-plot-series:last-child"),a=0;a<e.length;a++)i&&i.insertBefore(e[a],i.nextSibling);}}]),t}(),I=function(){function t(i){e(this,t),this.w=i.w,this.barCtx=i;}return a(t,[{key:"handleBarDataLabels",value:function(t){var e=t.x,i=t.y,a=t.y1,s=t.y2,r=t.i,n=t.j,o=t.realIndex,l=t.series,h=t.barHeight,c=t.barWidth,d=t.barYPosition,g=t.visibleSeries,u=t.renderedPath,f=this.w,x=new p(this.barCtx.ctx),b=Array.isArray(this.barCtx.strokeWidth)?this.barCtx.strokeWidth[o]:this.barCtx.strokeWidth,m=e+parseFloat(c*g),v=i+parseFloat(h*g);f.globals.isXNumeric&&!f.globals.isBarHorizontal&&(m=e+parseFloat(c*(g+1)),v=i+parseFloat(h*(g+1))-b);var y=e,w=i,k={},A=f.config.dataLabels,S=this.barCtx.barOptions.dataLabels;void 0!==d&&this.barCtx.isTimelineBar&&(v=d,w=d);var C=A.offsetX,L=A.offsetY,P={width:0,height:0};if(f.config.dataLabels.enabled){var T=String(f.globals.minY).length>String(f.globals.maxY).length?f.globals.minY:f.globals.maxY;P=x.getTextRects(f.globals.yLabelFormatters[0](T),parseFloat(A.style.fontSize));}var z={x:e,y:i,i:r,j:n,renderedPath:u,bcx:m,bcy:v,barHeight:h,barWidth:c,textRects:P,strokeWidth:b,dataLabelsX:y,dataLabelsY:w,barDataLabelsConfig:S,offX:C,offY:L};return k=this.barCtx.isHorizontal?this.calculateBarsDataLabelsPosition(z):this.calculateColumnsDataLabelsPosition(z),u.attr({cy:k.bcy,cx:k.bcx,j:n,val:l[r][n],barHeight:h,barWidth:c}),this.drawCalculatedDataLabels({x:k.dataLabelsX,y:k.dataLabelsY,val:this.barCtx.isTimelineBar?[a,s]:l[r][n],i:o,j:n,barWidth:c,barHeight:h,textRects:P,dataLabelsConfig:A})}},{key:"calculateColumnsDataLabelsPosition",value:function(t){var e,i=this.w,a=t.i,s=t.j,r=t.y,n=t.bcx,o=t.barWidth,l=t.barHeight,h=t.textRects,c=t.dataLabelsY,d=t.barDataLabelsConfig,g=t.strokeWidth,u=t.offX,f=t.offY;l=Math.abs(l);var p="vertical"===i.config.plotOptions.bar.dataLabels.orientation;n-=g/2;var x=i.globals.gridWidth/i.globals.dataPoints;if(e=i.globals.isXNumeric?n-o/2+u:n-x+o/2+u,p){e=e+h.height/2-g/2-2;}var b=this.barCtx.series[a][s]<0,m=r;switch(this.barCtx.isReversed&&(m=r-l+(b?2*l:0),r-=l),d.position){case"center":c=p?b?m+l/2+f:m+l/2-f:b?m-l/2+h.height/2+f:m+l/2+h.height/2-f;break;case"bottom":c=p?b?m+l+f:m+l-f:b?m-l+h.height+g+f:m+l-h.height/2+g-f;break;case"top":c=p?b?m+f:m-f:b?m-h.height/2-f:m+h.height+f;}return i.config.chart.stacked||(c<0?c=0+g:c+h.height/3>i.globals.gridHeight&&(c=i.globals.gridHeight-g)),{bcx:n,bcy:r,dataLabelsX:e,dataLabelsY:c}}},{key:"calculateBarsDataLabelsPosition",value:function(t){var e=this.w,i=t.x,a=t.i,s=t.j,r=t.bcy,n=t.barHeight,o=t.barWidth,l=t.textRects,h=t.dataLabelsX,c=t.strokeWidth,d=t.barDataLabelsConfig,g=t.offX,u=t.offY,f=e.globals.gridHeight/e.globals.dataPoints;o=Math.abs(o);var p=r-(this.barCtx.isTimelineBar?0:f)+n/2+l.height/2+u-3,x=this.barCtx.series[a][s]<0,b=i;switch(this.barCtx.isReversed&&(b=i+o-(x?2*o:0),i=e.globals.gridWidth-o),d.position){case"center":h=x?b+o/2-g:b-o/2+g;break;case"bottom":h=x?b+o-c-Math.round(l.width/2)-g:b-o+c+Math.round(l.width/2)+g;break;case"top":h=x?b-c+Math.round(l.width/2)-g:b-c-Math.round(l.width/2)+g;}return e.config.chart.stacked||(h<0?h=h+l.width+c:h+l.width/2>e.globals.gridWidth&&(h=e.globals.gridWidth-l.width-c)),{bcx:i,bcy:r,dataLabelsX:h,dataLabelsY:p}}},{key:"drawCalculatedDataLabels",value:function(t){var e=t.x,i=t.y,a=t.val,s=t.i,r=t.j,o=t.textRects,l=t.barHeight,h=t.barWidth,c=t.dataLabelsConfig,d=this.w,g="rotate(0)";"vertical"===d.config.plotOptions.bar.dataLabels.orientation&&(g="rotate(-90, ".concat(e,", ").concat(i,")"));var u=new z(this.barCtx.ctx),f=new p(this.barCtx.ctx),x=c.formatter,b=null,m=d.globals.collapsedSeriesIndices.indexOf(s)>-1;if(c.enabled&&!m){b=f.group({class:"apexcharts-data-labels",transform:g});var v="";void 0!==a&&(v=x(a,{seriesIndex:s,dataPointIndex:r,w:d})),0===a&&d.config.chart.stacked&&(v="");var y=d.globals.series[s][r]<=0,w=d.config.plotOptions.bar.dataLabels.position;if("vertical"===d.config.plotOptions.bar.dataLabels.orientation&&("top"===w&&(c.textAnchor=y?"end":"start"),"center"===w&&(c.textAnchor="middle"),"bottom"===w&&(c.textAnchor=y?"end":"start")),this.barCtx.isTimelineBar&&this.barCtx.barOptions.dataLabels.hideOverflowingLabels)h<f.getTextRects(v,parseFloat(c.style.fontSize)).width&&(v="");d.config.chart.stacked&&this.barCtx.barOptions.dataLabels.hideOverflowingLabels&&(this.barCtx.isHorizontal?((h=Math.abs(d.globals.series[s][r])/this.barCtx.invertedYRatio[this.barCtx.yaxisIndex])>0&&o.width/1.6>h||h<0&&o.width/1.6<h)&&(v=""):(l=Math.abs(d.globals.series[s][r])/this.barCtx.yRatio[this.barCtx.yaxisIndex],o.height/1.6>l&&(v="")));var k=n({},c);this.barCtx.isHorizontal&&a<0&&("start"===c.textAnchor?k.textAnchor="end":"end"===c.textAnchor&&(k.textAnchor="start")),u.plotDataLabelsText({x:e,y:i,text:v,i:s,j:r,parent:b,dataLabelsConfig:k,alwaysDrawDataLabel:!0,offsetCorrection:!0});}return b}}]),t}(),M=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.legendInactiveClass="legend-mouseover-inactive";}return a(t,[{key:"getAllSeriesEls",value:function(){return this.w.globals.dom.baseEl.getElementsByClassName("apexcharts-series")}},{key:"getSeriesByName",value:function(t){return this.w.globals.dom.baseEl.querySelector("[seriesName='".concat(g.escapeString(t),"']"))}},{key:"isSeriesHidden",value:function(t){var e=this.getSeriesByName(t),i=parseInt(e.getAttribute("data:realIndex"),10);return {isHidden:e.classList.contains("apexcharts-series-collapsed"),realIndex:i}}},{key:"addCollapsedClassToSeries",value:function(t,e){var i=this.w;function a(i){for(var a=0;a<i.length;a++)i[a].index===e&&t.node.classList.add("apexcharts-series-collapsed");}a(i.globals.collapsedSeries),a(i.globals.ancillaryCollapsedSeries);}},{key:"toggleSeries",value:function(t){var e=this.isSeriesHidden(t);return this.ctx.legend.legendHelpers.toggleDataSeries(e.realIndex,e.isHidden),e.isHidden}},{key:"showSeries",value:function(t){var e=this.isSeriesHidden(t);e.isHidden&&this.ctx.legend.legendHelpers.toggleDataSeries(e.realIndex,!0);}},{key:"hideSeries",value:function(t){var e=this.isSeriesHidden(t);e.isHidden||this.ctx.legend.legendHelpers.toggleDataSeries(e.realIndex,!1);}},{key:"resetSeries",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],a=this.w,s=g.clone(a.globals.initialSeries);a.globals.previousPaths=[],i?(a.globals.collapsedSeries=[],a.globals.ancillaryCollapsedSeries=[],a.globals.collapsedSeriesIndices=[],a.globals.ancillaryCollapsedSeriesIndices=[]):s=this.emptyCollapsedSeries(s),a.config.series=s,t&&(e&&(a.globals.zoomed=!1,this.ctx.updateHelpers.revertDefaultAxisMinMax()),this.ctx.updateHelpers._updateSeries(s,a.config.chart.animations.dynamicAnimation.enabled));}},{key:"emptyCollapsedSeries",value:function(t){for(var e=this.w,i=0;i<t.length;i++)e.globals.collapsedSeriesIndices.indexOf(i)>-1&&(t[i].data=[]);return t}},{key:"toggleSeriesOnHover",value:function(t,e){var i=this.w,a=i.globals.dom.baseEl.querySelectorAll(".apexcharts-series, .apexcharts-datalabels");if("mousemove"===t.type){var s=parseInt(e.getAttribute("rel"),10)-1,r=null,n=null;i.globals.axisCharts||"radialBar"===i.config.chart.type?i.globals.axisCharts?(r=i.globals.dom.baseEl.querySelector(".apexcharts-series[data\\:realIndex='".concat(s,"']")),n=i.globals.dom.baseEl.querySelector(".apexcharts-datalabels[data\\:realIndex='".concat(s,"']"))):r=i.globals.dom.baseEl.querySelector(".apexcharts-series[rel='".concat(s+1,"']")):r=i.globals.dom.baseEl.querySelector(".apexcharts-series[rel='".concat(s+1,"'] path"));for(var o=0;o<a.length;o++)a[o].classList.add(this.legendInactiveClass);null!==r&&(i.globals.axisCharts||r.parentNode.classList.remove(this.legendInactiveClass),r.classList.remove(this.legendInactiveClass),null!==n&&n.classList.remove(this.legendInactiveClass));}else if("mouseout"===t.type)for(var l=0;l<a.length;l++)a[l].classList.remove(this.legendInactiveClass);}},{key:"highlightRangeInSeries",value:function(t,e){var i=this,a=this.w,s=a.globals.dom.baseEl.getElementsByClassName("apexcharts-heatmap-rect"),r=function(t){for(var e=0;e<s.length;e++)s[e].classList[t](i.legendInactiveClass);};if("mousemove"===t.type){var n=parseInt(e.getAttribute("rel"),10)-1;r("add"),function(t){for(var e=0;e<s.length;e++){var a=parseInt(s[e].getAttribute("val"),10);a>=t.from&&a<=t.to&&s[e].classList.remove(i.legendInactiveClass);}}(a.config.plotOptions.heatmap.colorScale.ranges[n]);}else "mouseout"===t.type&&r("remove");}},{key:"getActiveConfigSeriesIndex",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0],e=this.w,i=0;if(e.config.series.length>1)for(var a=e.config.series.map((function(i,a){var s=!1;return t&&(s="bar"===e.config.series[a].type||"column"===e.config.series[a].type),i.data&&i.data.length>0&&!s?a:-1})),s=0;s<a.length;s++)if(-1!==a[s]){i=a[s];break}return i}},{key:"getPreviousPaths",value:function(){var t=this.w;function e(e,i,a){for(var s=e[i].childNodes,r={type:a,paths:[],realIndex:e[i].getAttribute("data:realIndex")},n=0;n<s.length;n++)if(s[n].hasAttribute("pathTo")){var o=s[n].getAttribute("pathTo");r.paths.push({d:o});}t.globals.previousPaths.push(r);}t.globals.previousPaths=[];["line","area","bar","candlestick","radar"].forEach((function(i){for(var a,s=(a=i,t.globals.dom.baseEl.querySelectorAll(".apexcharts-".concat(a,"-series .apexcharts-series"))),r=0;r<s.length;r++)e(s,r,i);})),this.handlePrevBubbleScatterPaths("bubble"),this.handlePrevBubbleScatterPaths("scatter");var i=t.globals.dom.baseEl.querySelectorAll(".apexcharts-heatmap .apexcharts-series");if(i.length>0)for(var a=0;a<i.length;a++){for(var s=t.globals.dom.baseEl.querySelectorAll(".apexcharts-heatmap .apexcharts-series[data\\:realIndex='".concat(a,"'] rect")),r=[],n=0;n<s.length;n++)r.push({color:s[n].getAttribute("color")});t.globals.previousPaths.push(r);}t.globals.axisCharts||(t.globals.previousPaths=t.globals.series);}},{key:"handlePrevBubbleScatterPaths",value:function(t){var e=this.w,i=e.globals.dom.baseEl.querySelectorAll(".apexcharts-".concat(t,"-series .apexcharts-series"));if(i.length>0)for(var a=0;a<i.length;a++){for(var s=e.globals.dom.baseEl.querySelectorAll(".apexcharts-".concat(t,"-series .apexcharts-series[data\\:realIndex='").concat(a,"'] circle")),r=[],n=0;n<s.length;n++)r.push({x:s[n].getAttribute("cx"),y:s[n].getAttribute("cy"),r:s[n].getAttribute("r")});e.globals.previousPaths.push(r);}}},{key:"clearPreviousPaths",value:function(){var t=this.w;t.globals.previousPaths=[],t.globals.allSeriesCollapsed=!1;}},{key:"handleNoData",value:function(){var t=this.w,e=t.config.noData,i=new p(this.ctx),a=t.globals.svgWidth/2,s=t.globals.svgHeight/2,r="middle";if(t.globals.noData=!0,t.globals.animationEnded=!0,"left"===e.align?(a=10,r="start"):"right"===e.align&&(a=t.globals.svgWidth-10,r="end"),"top"===e.verticalAlign?s=50:"bottom"===e.verticalAlign&&(s=t.globals.svgHeight-50),a+=e.offsetX,s=s+parseInt(e.style.fontSize,10)+2+e.offsetY,void 0!==e.text&&""!==e.text){var n=i.drawText({x:a,y:s,text:e.text,textAnchor:r,fontSize:e.style.fontSize,fontFamily:e.style.fontFamily,foreColor:e.style.color,opacity:1,class:"apexcharts-text-nodata"});t.globals.dom.Paper.add(n);}}},{key:"setNullSeriesToZeroValues",value:function(t){for(var e=this.w,i=0;i<t.length;i++)if(0===t[i].length)for(var a=0;a<t[e.globals.maxValsInArrayIndex].length;a++)t[i].push(0);return t}},{key:"hasAllSeriesEqualX",value:function(){for(var t=!0,e=this.w,i=this.filteredSeriesX(),a=0;a<i.length-1;a++)if(i[a][0]!==i[a+1][0]){t=!1;break}return e.globals.allSeriesHasEqualX=t,t}},{key:"filteredSeriesX",value:function(){var t=this.w.globals.seriesX.map((function(t){return t.length>0?t:[]}));return t}}]),t}(),E=function(){function t(i){e(this,t),this.w=i.w,this.barCtx=i;}return a(t,[{key:"initVariables",value:function(t){var e=this.w;this.barCtx.series=t,this.barCtx.totalItems=0,this.barCtx.seriesLen=0,this.barCtx.visibleI=-1,this.barCtx.visibleItems=1;for(var i=0;i<t.length;i++)if(t[i].length>0&&(this.barCtx.seriesLen=this.barCtx.seriesLen+1,this.barCtx.totalItems+=t[i].length),e.globals.isXNumeric)for(var a=0;a<t[i].length;a++)e.globals.seriesX[i][a]>e.globals.minX&&e.globals.seriesX[i][a]<e.globals.maxX&&this.barCtx.visibleItems++;else this.barCtx.visibleItems=e.globals.dataPoints;0===this.barCtx.seriesLen&&(this.barCtx.seriesLen=1);}},{key:"initialPositions",value:function(){var t,e,i,a,s,r,n,o,l=this.w,h=l.globals.dataPoints;if(this.barCtx.isTimelineBar&&(h=l.globals.labels.length),this.barCtx.isHorizontal)s=(i=l.globals.gridHeight/h)/this.barCtx.seriesLen,l.globals.isXNumeric&&(s=(i=l.globals.gridHeight/this.barCtx.totalItems)/this.barCtx.seriesLen),s=s*parseInt(this.barCtx.barOptions.barHeight,10)/100,o=this.barCtx.baseLineInvertedY+l.globals.padHorizontal+(this.barCtx.isReversed?l.globals.gridWidth:0)-(this.barCtx.isReversed?2*this.barCtx.baseLineInvertedY:0),e=(i-s*this.barCtx.seriesLen)/2;else {if(a=l.globals.gridWidth/this.barCtx.visibleItems,l.config.xaxis.convertedCatToNumeric&&(a=l.globals.gridWidth/l.globals.dataPoints),r=a/this.barCtx.seriesLen*parseInt(this.barCtx.barOptions.columnWidth,10)/100,l.globals.isXNumeric){var c=this.barCtx.xRatio;l.config.xaxis.convertedCatToNumeric&&(c=this.barCtx.initialXRatio),l.globals.minXDiff&&.5!==l.globals.minXDiff&&l.globals.minXDiff/c>0&&(a=l.globals.minXDiff/c),(r=a/this.barCtx.seriesLen*parseInt(this.barCtx.barOptions.columnWidth,10)/100)<1&&(r=1);}n=l.globals.gridHeight-this.barCtx.baseLineY[this.barCtx.yaxisIndex]-(this.barCtx.isReversed?l.globals.gridHeight:0)+(this.barCtx.isReversed?2*this.barCtx.baseLineY[this.barCtx.yaxisIndex]:0),t=l.globals.padHorizontal+(a-r*this.barCtx.seriesLen)/2;}return {x:t,y:e,yDivision:i,xDivision:a,barHeight:s,barWidth:r,zeroH:n,zeroW:o}}},{key:"getPathFillColor",value:function(t,e,i,a){var s=this.w,r=new L(this.barCtx.ctx),n=null,o=this.barCtx.barOptions.distributed?i:e;this.barCtx.barOptions.colors.ranges.length>0&&this.barCtx.barOptions.colors.ranges.map((function(a){t[e][i]>=a.from&&t[e][i]<=a.to&&(n=a.color);}));return s.config.series[e].data[i]&&s.config.series[e].data[i].fillColor&&(n=s.config.series[e].data[i].fillColor),r.fillPath({seriesNumber:this.barCtx.barOptions.distributed?o:a,dataPointIndex:i,color:n,value:t[e][i]})}},{key:"getStrokeWidth",value:function(t,e,i){var a=0,s=this.w;return void 0===this.barCtx.series[t][e]||null===this.barCtx.series[t][e]?this.barCtx.isNullValue=!0:this.barCtx.isNullValue=!1,s.config.stroke.show&&(this.barCtx.isNullValue||(a=Array.isArray(this.barCtx.strokeWidth)?this.barCtx.strokeWidth[i]:this.barCtx.strokeWidth)),a}},{key:"barBackground",value:function(t){var e=t.bc,i=t.i,a=t.x1,s=t.x2,r=t.y1,n=t.y2,o=t.elSeries,l=this.w,h=new p(this.barCtx.ctx),c=new M(this.barCtx.ctx).getActiveConfigSeriesIndex();if(this.barCtx.barOptions.colors.backgroundBarColors.length>0&&c===i){e>=this.barCtx.barOptions.colors.backgroundBarColors.length&&(e=0);var d=this.barCtx.barOptions.colors.backgroundBarColors[e],g=h.drawRect(void 0!==a?a:0,void 0!==r?r:0,void 0!==s?s:l.globals.gridWidth,void 0!==n?n:l.globals.gridHeight,this.barCtx.barOptions.colors.backgroundBarRadius,d,this.barCtx.barOptions.colors.backgroundBarOpacity);o.add(g),g.node.classList.add("apexcharts-backgroundBar");}}},{key:"getColumnPaths",value:function(t){var e=t.barWidth,i=t.barXPosition,a=t.yRatio,s=t.y1,r=t.y2,n=t.strokeWidth,o=t.series,l=t.realIndex,h=t.i,c=t.j,d=t.w,g=new p(this.barCtx.ctx);(n=Array.isArray(n)?n[l]:n)||(n=0);var u={barWidth:e,strokeWidth:n,yRatio:a,barXPosition:i,y1:s,y2:r},f=this.getRoundedBars(d,u,o,h,c),x=i,b=i+e,m=g.move(x,f.y1),v=g.move(x,f.y1);return d.globals.previousPaths.length>0&&(v=this.barCtx.getPreviousPath(l,c,!1)),{pathTo:m=m+g.line(x,f.y2)+f.endingPath+g.line(b-n,f.y2)+g.line(b-n,f.y1)+f.startingPath+"z",pathFrom:v=v+g.line(x,s)+g.line(b-n,s)+g.line(b-n,s)+g.line(b-n,s)+g.line(x,s)}}},{key:"getBarpaths",value:function(t){var e=t.barYPosition,i=t.barHeight,a=t.x1,s=t.x2,r=t.strokeWidth,n=t.series,o=t.realIndex,l=t.i,h=t.j,c=t.w,d=new p(this.barCtx.ctx);(r=Array.isArray(r)?r[o]:r)||(r=0);var g={barHeight:i,strokeWidth:r,barYPosition:e,x2:s,x1:a},u=this.getRoundedBars(c,g,n,l,h),f=d.move(u.x1,e),x=d.move(u.x1,e);c.globals.previousPaths.length>0&&(x=this.barCtx.getPreviousPath(o,h,!1));var b=e,m=e+i;return {pathTo:f=f+d.line(u.x2,b)+u.endingPath+d.line(u.x2,m-r)+d.line(u.x1,m-r)+u.startingPath+"z",pathFrom:x=x+d.line(a,b)+d.line(a,m-r)+d.line(a,m-r)+d.line(a,m-r)+d.line(a,b)}}},{key:"getRoundedBars",value:function(t,e,i,a,s){var r=new p(this.barCtx.ctx),n=Array.isArray(e.strokeWidth)?e.strokeWidth[a]:e.strokeWidth;if(n||(n=0),this.barCtx.isHorizontal){var o=null,l="",h=e.x2,c=e.x1;if(void 0!==i[a][s]||null!==i[a][s]){var d=i[a][s]<0,g=e.barHeight/2-n;switch(d&&(g=-e.barHeight/2-n),g>Math.abs(h-c)&&(g=Math.abs(h-c)),"rounded"===this.barCtx.barOptions.endingShape&&(h=e.x2-g/2),"rounded"===this.barCtx.barOptions.startingShape&&(c=e.x1+g/2),this.barCtx.barOptions.endingShape){case"flat":o=r.line(h,e.barYPosition+e.barHeight-n);break;case"rounded":o=r.quadraticCurve(h+g,e.barYPosition+(e.barHeight-n)/2,h,e.barYPosition+e.barHeight-n);}switch(this.barCtx.barOptions.startingShape){case"flat":l=r.line(c,e.barYPosition+e.barHeight-n);break;case"rounded":l=r.quadraticCurve(c-g,e.barYPosition+e.barHeight/2,c,e.barYPosition);}}return {endingPath:o,startingPath:l,x2:h,x1:c}}var u=null,f="",x=e.y2,b=e.y1;if(void 0!==i[a][s]||null!==i[a][s]){var m=i[a][s]<0,v=e.barWidth/2-n;switch(m&&(v=-e.barWidth/2-n),v>Math.abs(x-b)&&(v=Math.abs(x-b)),"rounded"===this.barCtx.barOptions.endingShape&&(x+=v/2),"rounded"===this.barCtx.barOptions.startingShape&&(b-=v/2),this.barCtx.barOptions.endingShape){case"flat":u=r.line(e.barXPosition+e.barWidth-n,x);break;case"rounded":u=r.quadraticCurve(e.barXPosition+(e.barWidth-n)/2,x-v,e.barXPosition+e.barWidth-n,x);}switch(this.barCtx.barOptions.startingShape){case"flat":f=r.line(e.barXPosition+e.barWidth-n,b);break;case"rounded":f=r.quadraticCurve(e.barXPosition+(e.barWidth-n)/2,b+v,e.barXPosition,b);}}return {endingPath:u,startingPath:f,y2:x,y1:b}}}]),t}(),X=function(){function t(i,a){e(this,t),this.ctx=i,this.w=i.w;var s=this.w;this.barOptions=s.config.plotOptions.bar,this.isHorizontal=this.barOptions.horizontal,this.strokeWidth=s.config.stroke.width,this.isNullValue=!1,this.isTimelineBar="datetime"===s.config.xaxis.type&&s.globals.seriesRangeBarTimeline.length,this.xyRatios=a,null!==this.xyRatios&&(this.xRatio=a.xRatio,this.initialXRatio=a.initialXRatio,this.yRatio=a.yRatio,this.invertedXRatio=a.invertedXRatio,this.invertedYRatio=a.invertedYRatio,this.baseLineY=a.baseLineY,this.baseLineInvertedY=a.baseLineInvertedY),this.yaxisIndex=0,this.seriesLen=0,this.barHelpers=new E(this);}return a(t,[{key:"draw",value:function(t,e){var i=this.w,a=new p(this.ctx),s=new m(this.ctx,i);t=s.getLogSeries(t),this.series=t,this.yRatio=s.getLogYRatios(this.yRatio),this.barHelpers.initVariables(t);var r=a.group({class:"apexcharts-bar-series apexcharts-plot-series"});i.config.dataLabels.enabled&&this.totalItems>this.barOptions.dataLabels.maxItems&&console.warn("WARNING: DataLabels are enabled but there are too many to display. This may cause performance issue when rendering.");for(var o=0,l=0;o<t.length;o++,l++){var h,c,d,u,f=void 0,x=void 0,b=[],v=[],y=i.globals.comboCharts?e[o]:o,w=a.group({class:"apexcharts-series",rel:o+1,seriesName:g.escapeString(i.globals.seriesNames[y]),"data:realIndex":y});this.ctx.series.addCollapsedClassToSeries(w,y),t[o].length>0&&(this.visibleI=this.visibleI+1);var k=0,A=0;this.yRatio.length>1&&(this.yaxisIndex=y),this.isReversed=i.config.yaxis[this.yaxisIndex]&&i.config.yaxis[this.yaxisIndex].reversed;var S=this.barHelpers.initialPositions();x=S.y,k=S.barHeight,c=S.yDivision,u=S.zeroW,f=S.x,A=S.barWidth,h=S.xDivision,d=S.zeroH,this.horizontal||v.push(f+A/2);for(var C=a.group({class:"apexcharts-datalabels","data:realIndex":y}),L=0;L<i.globals.dataPoints;L++){var P=this.barHelpers.getStrokeWidth(o,L,y),T=null,z={indexes:{i:o,j:L,realIndex:y,bc:l},x:f,y:x,strokeWidth:P,elSeries:w};this.isHorizontal?(T=this.drawBarPaths(n({},z,{barHeight:k,zeroW:u,yDivision:c})),A=this.series[o][L]/this.invertedYRatio):(T=this.drawColumnPaths(n({},z,{xDivision:h,barWidth:A,zeroH:d})),k=this.series[o][L]/this.yRatio[this.yaxisIndex]),x=T.y,f=T.x,L>0&&v.push(f+A/2),b.push(x);var I=this.barHelpers.getPathFillColor(t,o,L,y);this.renderSeries({realIndex:y,pathFill:I,j:L,i:o,pathFrom:T.pathFrom,pathTo:T.pathTo,strokeWidth:P,elSeries:w,x:f,y:x,series:t,barHeight:k,barWidth:A,elDataLabelsWrap:C,visibleSeries:this.visibleI,type:"bar"});}i.globals.seriesXvalues[y]=v,i.globals.seriesYvalues[y]=b,r.add(w);}return r}},{key:"renderSeries",value:function(t){var e=t.realIndex,i=t.pathFill,a=t.lineFill,s=t.j,r=t.i,n=t.pathFrom,o=t.pathTo,l=t.strokeWidth,h=t.elSeries,c=t.x,d=t.y,g=t.y1,f=t.y2,x=t.series,b=t.barHeight,m=t.barWidth,v=t.barYPosition,y=t.elDataLabelsWrap,w=t.visibleSeries,k=t.type,A=this.w,S=new p(this.ctx);a||(a=this.barOptions.distributed?A.globals.stroke.colors[s]:A.globals.stroke.colors[e]),A.config.series[r].data[s]&&A.config.series[r].data[s].strokeColor&&(a=A.config.series[r].data[s].strokeColor),this.isNullValue&&(i="none");var C=s/A.config.chart.animations.animateGradually.delay*(A.config.chart.animations.speed/A.globals.dataPoints)/2.4,L=S.renderPaths({i:r,j:s,realIndex:e,pathFrom:n,pathTo:o,stroke:a,strokeWidth:l,strokeLineCap:A.config.stroke.lineCap,fill:i,animationDelay:C,initialSpeed:A.config.chart.animations.speed,dataChangeSpeed:A.config.chart.animations.dynamicAnimation.speed,className:"apexcharts-".concat(k,"-area")});L.attr("clip-path","url(#gridRectMask".concat(A.globals.cuid,")")),void 0!==g&&void 0!==f&&(L.attr("data-range-y1",g),L.attr("data-range-y2",f)),new u(this.ctx).setSelectionFilter(L,e,s),h.add(L);var P=new I(this).handleBarDataLabels({x:c,y:d,y1:g,y2:f,i:r,j:s,series:x,realIndex:e,barHeight:b,barWidth:m,barYPosition:v,renderedPath:L,visibleSeries:w});return null!==P&&y.add(P),h.add(y),h}},{key:"drawBarPaths",value:function(t){var e=t.indexes,i=t.barHeight,a=t.strokeWidth,s=t.zeroW,r=t.x,n=t.y,o=t.yDivision,l=t.elSeries,h=this.w,c=e.i,d=e.j,g=e.bc;h.globals.isXNumeric&&(n=(h.globals.seriesX[c][d]-h.globals.minX)/this.invertedXRatio-i);var u=n+i*this.visibleI;r=void 0===this.series[c][d]||null===this.series[c][d]?s:s+this.series[c][d]/this.invertedYRatio-2*(this.isReversed?this.series[c][d]/this.invertedYRatio:0);var f=this.barHelpers.getBarpaths({barYPosition:u,barHeight:i,x1:s,x2:r,strokeWidth:a,series:this.series,realIndex:e.realIndex,i:c,j:d,w:h});return h.globals.isXNumeric||(n+=o),this.barHelpers.barBackground({bc:g,i:c,y1:u-i*this.visibleI,y2:i*this.seriesLen,elSeries:l}),{pathTo:f.pathTo,pathFrom:f.pathFrom,x:r,y:n,barYPosition:u}}},{key:"drawColumnPaths",value:function(t){var e=t.indexes,i=t.x,a=t.y,s=t.xDivision,r=t.barWidth,n=t.zeroH,o=t.strokeWidth,l=t.elSeries,h=this.w,c=e.i,d=e.j,g=e.bc;if(h.globals.isXNumeric){var u=c;h.globals.seriesX[c].length||(u=h.globals.maxValsInArrayIndex),i=(h.globals.seriesX[u][d]-h.globals.minX)/this.xRatio-r*this.seriesLen/2;}var f=i+r*this.visibleI;a=void 0===this.series[c][d]||null===this.series[c][d]?n:n-this.series[c][d]/this.yRatio[this.yaxisIndex]+2*(this.isReversed?this.series[c][d]/this.yRatio[this.yaxisIndex]:0);var p=this.barHelpers.getColumnPaths({barXPosition:f,barWidth:r,y1:n,y2:a,strokeWidth:o,series:this.series,realIndex:e.realIndex,i:c,j:d,w:h});return h.globals.isXNumeric||(i+=s),this.barHelpers.barBackground({bc:g,i:c,x1:f-o/2-r*this.visibleI,x2:r*this.seriesLen+o/2,elSeries:l}),{pathTo:p.pathTo,pathFrom:p.pathFrom,x:i,y:a,barXPosition:f}}},{key:"getPreviousPath",value:function(t,e){for(var i,a=this.w,s=0;s<a.globals.previousPaths.length;s++){var r=a.globals.previousPaths[s];r.paths&&r.paths.length>0&&parseInt(r.realIndex,10)===parseInt(t,10)&&void 0!==a.globals.previousPaths[s].paths[e]&&(i=a.globals.previousPaths[s].paths[e].d);}return i}}]),t}(),Y=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.months31=[1,3,5,7,8,10,12],this.months30=[2,4,6,9,11],this.daysCntOfYear=[0,31,59,90,120,151,181,212,243,273,304,334];}return a(t,[{key:"isValidDate",value:function(t){return !isNaN(this.parseDate(t))}},{key:"getTimeStamp",value:function(t){return Date.parse(t)?this.w.config.xaxis.labels.datetimeUTC?new Date(new Date(t).toISOString().substr(0,25)).getTime():new Date(t).getTime():t}},{key:"getDate",value:function(t){return this.w.config.xaxis.labels.datetimeUTC?new Date(new Date(t).toUTCString()):new Date(t)}},{key:"parseDate",value:function(t){var e=Date.parse(t);if(!isNaN(e))return this.getTimeStamp(t);var i=Date.parse(t.replace(/-/g,"/").replace(/[a-z]+/gi," "));return i=this.getTimeStamp(i)}},{key:"formatDate",value:function(t,e){var i=this.w.globals.locale,a=this.w.config.xaxis.labels.datetimeUTC,s=["\0"].concat(d(i.months)),r=["\x01"].concat(d(i.shortMonths)),n=["\x02"].concat(d(i.days)),o=["\x03"].concat(d(i.shortDays));function l(t,e){var i=t+"";for(e=e||2;i.length<e;)i="0"+i;return i}var h=a?t.getUTCFullYear():t.getFullYear();e=(e=(e=e.replace(/(^|[^\\])yyyy+/g,"$1"+h)).replace(/(^|[^\\])yy/g,"$1"+h.toString().substr(2,2))).replace(/(^|[^\\])y/g,"$1"+h);var c=(a?t.getUTCMonth():t.getMonth())+1;e=(e=(e=(e=e.replace(/(^|[^\\])MMMM+/g,"$1"+s[0])).replace(/(^|[^\\])MMM/g,"$1"+r[0])).replace(/(^|[^\\])MM/g,"$1"+l(c))).replace(/(^|[^\\])M/g,"$1"+c);var g=a?t.getUTCDate():t.getDate();e=(e=(e=(e=e.replace(/(^|[^\\])dddd+/g,"$1"+n[0])).replace(/(^|[^\\])ddd/g,"$1"+o[0])).replace(/(^|[^\\])dd/g,"$1"+l(g))).replace(/(^|[^\\])d/g,"$1"+g);var u=a?t.getUTCHours():t.getHours(),f=u>12?u-12:0===u?12:u;e=(e=(e=(e=e.replace(/(^|[^\\])HH+/g,"$1"+l(u))).replace(/(^|[^\\])H/g,"$1"+u)).replace(/(^|[^\\])hh+/g,"$1"+l(f))).replace(/(^|[^\\])h/g,"$1"+f);var p=a?t.getUTCMinutes():t.getMinutes();e=(e=e.replace(/(^|[^\\])mm+/g,"$1"+l(p))).replace(/(^|[^\\])m/g,"$1"+p);var x=a?t.getUTCSeconds():t.getSeconds();e=(e=e.replace(/(^|[^\\])ss+/g,"$1"+l(x))).replace(/(^|[^\\])s/g,"$1"+x);var b=a?t.getUTCMilliseconds():t.getMilliseconds();e=e.replace(/(^|[^\\])fff+/g,"$1"+l(b,3)),b=Math.round(b/10),e=e.replace(/(^|[^\\])ff/g,"$1"+l(b)),b=Math.round(b/10);var m=u<12?"AM":"PM";e=(e=(e=e.replace(/(^|[^\\])f/g,"$1"+b)).replace(/(^|[^\\])TT+/g,"$1"+m)).replace(/(^|[^\\])T/g,"$1"+m.charAt(0));var v=m.toLowerCase();e=(e=e.replace(/(^|[^\\])tt+/g,"$1"+v)).replace(/(^|[^\\])t/g,"$1"+v.charAt(0));var y=-t.getTimezoneOffset(),w=a||!y?"Z":y>0?"+":"-";if(!a){var k=(y=Math.abs(y))%60;w+=l(Math.floor(y/60))+":"+l(k);}e=e.replace(/(^|[^\\])K/g,"$1"+w);var A=(a?t.getUTCDay():t.getDay())+1;return e=(e=(e=(e=(e=e.replace(new RegExp(n[0],"g"),n[A])).replace(new RegExp(o[0],"g"),o[A])).replace(new RegExp(s[0],"g"),s[c])).replace(new RegExp(r[0],"g"),r[c])).replace(/\\(.)/g,"$1")}},{key:"getTimeUnitsfromTimestamp",value:function(t,e,i){var a=this.w;void 0!==a.config.xaxis.min&&(t=a.config.xaxis.min),void 0!==a.config.xaxis.max&&(e=a.config.xaxis.max);var s=this.getDate(t),r=this.getDate(e),n=this.formatDate(s,"yyyy MM dd HH mm").split(" "),o=this.formatDate(r,"yyyy MM dd HH mm").split(" ");return {minMinute:parseInt(n[4],10),maxMinute:parseInt(o[4],10),minHour:parseInt(n[3],10),maxHour:parseInt(o[3],10),minDate:parseInt(n[2],10),maxDate:parseInt(o[2],10),minMonth:parseInt(n[1],10)-1,maxMonth:parseInt(o[1],10)-1,minYear:parseInt(n[0],10),maxYear:parseInt(o[0],10)}}},{key:"isLeapYear",value:function(t){return t%4==0&&t%100!=0||t%400==0}},{key:"calculcateLastDaysOfMonth",value:function(t,e,i){return this.determineDaysOfMonths(t,e)-i}},{key:"determineDaysOfYear",value:function(t){var e=365;return this.isLeapYear(t)&&(e=366),e}},{key:"determineRemainingDaysOfYear",value:function(t,e,i){var a=this.daysCntOfYear[e]+i;return e>1&&this.isLeapYear()&&a++,a}},{key:"determineDaysOfMonths",value:function(t,e){var i=30;switch(t=g.monthMod(t),!0){case this.months30.indexOf(t)>-1:2===t&&(i=this.isLeapYear(e)?29:28);break;case this.months31.indexOf(t)>-1:default:i=31;}return i}}]),t}(),F=function(t){function i(){return e(this,i),c(this,l(i).apply(this,arguments))}return o(i,X),a(i,[{key:"draw",value:function(t,e){var i=this.w,a=new p(this.ctx);this.rangeBarOptions=this.w.config.plotOptions.rangeBar,this.series=t,this.seriesRangeStart=i.globals.seriesRangeStart,this.seriesRangeEnd=i.globals.seriesRangeEnd,this.barHelpers.initVariables(t);for(var s=a.group({class:"apexcharts-rangebar-series apexcharts-plot-series"}),r=0;r<t.length;r++){var o,l,h,c=void 0,d=void 0,u=void 0,f=i.globals.comboCharts?e[r]:r,x=a.group({class:"apexcharts-series",seriesName:g.escapeString(i.globals.seriesNames[f]),rel:r+1,"data:realIndex":f});t[r].length>0&&(this.visibleI=this.visibleI+1);var b=0,m=0;this.yRatio.length>1&&(this.yaxisIndex=f);var v=this.barHelpers.initialPositions();d=v.y,h=v.zeroW,c=v.x,m=v.barWidth,o=v.xDivision,l=v.zeroH;for(var y=a.group({class:"apexcharts-datalabels","data:realIndex":f}),w=0;w<i.globals.dataPoints;w++){var k=this.barHelpers.getStrokeWidth(r,w,f),A=this.seriesRangeStart[r][w],S=this.seriesRangeEnd[r][w],C=null,L=null,P={x:c,y:d,strokeWidth:k,elSeries:x};if(u=v.yDivision,b=v.barHeight,this.isHorizontal){L=d+b*this.visibleI;var T=(u-b*this.seriesLen)/2;if(void 0===i.config.series[r].data[w])break;if(this.isTimelineBar&&i.config.series[r].data[w].x){var z=this.detectOverlappingBars({i:r,j:w,barYPosition:L,srty:T,barHeight:b,yDivision:u,initPositions:v});b=z.barHeight,L=z.barYPosition;}m=(C=this.drawRangeBarPaths(n({indexes:{i:r,j:w,realIndex:f},barHeight:b,barYPosition:L,zeroW:h,yDivision:u,y1:A,y2:S},P))).barWidth;}else b=(C=this.drawRangeColumnPaths(n({indexes:{i:r,j:w,realIndex:f},zeroH:l,barWidth:m,xDivision:o},P))).barHeight;d=C.y,c=C.x;var I=this.barHelpers.getPathFillColor(t,r,w,f),M=i.globals.stroke.colors[f];this.renderSeries({realIndex:f,pathFill:I,lineFill:M,j:w,i:r,x:c,y:d,y1:A,y2:S,pathFrom:C.pathFrom,pathTo:C.pathTo,strokeWidth:k,elSeries:x,series:t,barHeight:b,barYPosition:L,barWidth:m,elDataLabelsWrap:y,visibleSeries:this.visibleI,type:"rangebar"});}s.add(x);}return s}},{key:"detectOverlappingBars",value:function(t){var e=t.i,i=t.j,a=t.barYPosition,s=t.srty,r=t.barHeight,n=t.yDivision,o=t.initPositions,l=this.w,h=[],c=l.config.series[e].data[i].rangeName,d=l.config.series[e].data[i].x,g=l.globals.labels.indexOf(d),u=l.globals.seriesRangeBarTimeline[e].findIndex((function(t){return t.x===d&&t.overlaps.length>0}));return a=s+r*this.visibleI+n*g,u>-1&&!l.config.plotOptions.bar.rangeBarOverlap&&(h=l.globals.seriesRangeBarTimeline[e][u].overlaps).indexOf(c)>-1&&(a=(r=o.barHeight/h.length)*this.visibleI+n*(100-parseInt(this.barOptions.barHeight,10))/100/2+r*(this.visibleI+h.indexOf(c))+n*g),{barYPosition:a,barHeight:r}}},{key:"drawRangeColumnPaths",value:function(t){var e=t.indexes,i=t.x,a=(t.strokeWidth,t.xDivision),s=t.barWidth,r=t.zeroH,n=this.w,o=e.i,l=e.j,h=this.yRatio[this.yaxisIndex],c=e.realIndex,d=this.getRangeValue(c,l),g=Math.min(d.start,d.end),u=Math.max(d.start,d.end);n.globals.isXNumeric&&(i=(n.globals.seriesX[o][l]-n.globals.minX)/this.xRatio-s/2);var f=i+s*this.visibleI;void 0===this.series[o][l]||null===this.series[o][l]?g=r:(g=r-g/h,u=r-u/h);var p=Math.abs(u-g),x=this.barHelpers.getColumnPaths({barXPosition:f,barWidth:s,y1:g,y2:u,strokeWidth:this.strokeWidth,series:this.seriesRangeEnd,i:c,j:l,w:n});return n.globals.isXNumeric||(i+=a),{pathTo:x.pathTo,pathFrom:x.pathFrom,barHeight:p,x:i,y:u,barXPosition:f}}},{key:"drawRangeBarPaths",value:function(t){var e=t.indexes,i=t.y,a=t.y1,s=t.y2,r=t.yDivision,n=t.barHeight,o=t.barYPosition,l=t.zeroW,h=this.w,c=l+a/this.invertedYRatio,d=l+s/this.invertedYRatio,g=Math.abs(d-c),u=this.barHelpers.getBarpaths({barYPosition:o,barHeight:n,x1:c,x2:d,strokeWidth:this.strokeWidth,series:this.seriesRangeEnd,i:e.realIndex,j:e.j,w:h});return h.globals.isXNumeric||(i+=r),{pathTo:u.pathTo,pathFrom:u.pathFrom,barWidth:g,x:d,y:i}}},{key:"getRangeValue",value:function(t,e){var i=this.w;return {start:i.globals.seriesRangeStart[t][e],end:i.globals.seriesRangeEnd[t][e]}}},{key:"getTooltipValues",value:function(t){var e=t.ctx,i=t.seriesIndex,a=t.dataPointIndex,s=t.y1,r=t.y2,n=t.w,o=n.globals.seriesRangeStart[i][a],l=n.globals.seriesRangeEnd[i][a],h=n.globals.labels[a],c=n.config.series[i].name,d=n.config.tooltip.y.formatter,g=n.config.tooltip.y.title.formatter,u={w:n,seriesIndex:i,dataPointIndex:a};"function"==typeof g&&(c=g(c,u)),s&&r&&(o=s,l=r,n.config.series[i].data[a].x&&(h=n.config.series[i].data[a].x+":"),"function"==typeof d&&(h=d(h,u)));var f="",p="",x=n.globals.colors[i];if(void 0===n.config.tooltip.x.formatter)if("datetime"===n.config.xaxis.type){var b=new Y(e);f=b.formatDate(b.getDate(o),n.config.tooltip.x.format),p=b.formatDate(b.getDate(l),n.config.tooltip.x.format);}else f=o,p=l;else f=n.config.tooltip.x.formatter(o),p=n.config.tooltip.x.formatter(l);return {start:o,end:l,startVal:f,endVal:p,ylabel:h,color:x,seriesName:c}}},{key:"buildCustomTooltipHTML",value:function(t){var e=t.color,i=t.seriesName;return '<div class="apexcharts-tooltip-rangebar"><div> <span class="series-name" style="color: '+e+'">'+(i||"")+'</span></div><div> <span class="category">'+t.ylabel+' </span> <span class="value start-value">'+t.start+'</span> <span class="separator">-</span> <span class="value end-value">'+t.end+"</span></div></div>"}}]),i}(),R=function(){function t(i){e(this,t),this.opts=i;}return a(t,[{key:"line",value:function(){return {chart:{animations:{easing:"swing"}},dataLabels:{enabled:!1},stroke:{width:5,curve:"straight"},markers:{size:0,hover:{sizeOffset:6}},xaxis:{crosshairs:{width:1}}}}},{key:"sparkline",value:function(t){this.opts.yaxis[0].show=!1,this.opts.yaxis[0].title.text="",this.opts.yaxis[0].axisBorder.show=!1,this.opts.yaxis[0].axisTicks.show=!1,this.opts.yaxis[0].floating=!0;return g.extend(t,{grid:{show:!1,padding:{left:0,right:0,top:0,bottom:0}},legend:{show:!1},xaxis:{labels:{show:!1},tooltip:{enabled:!1},axisBorder:{show:!1},axisTicks:{show:!1}},chart:{toolbar:{show:!1},zoom:{enabled:!1}},dataLabels:{enabled:!1}})}},{key:"bar",value:function(){return {chart:{stacked:!1,animations:{easing:"swing"}},plotOptions:{bar:{dataLabels:{position:"center"}}},dataLabels:{style:{colors:["#fff"]},background:{enabled:!1}},stroke:{width:0,lineCap:"square"},fill:{opacity:.85},legend:{markers:{shape:"square",radius:2,size:8}},tooltip:{shared:!1},xaxis:{tooltip:{enabled:!1},tickPlacement:"between",crosshairs:{width:"barWidth",position:"back",fill:{type:"gradient"},dropShadow:{enabled:!1},stroke:{width:0}}}}}},{key:"candlestick",value:function(){return {stroke:{width:1,colors:["#333"]},fill:{opacity:1},dataLabels:{enabled:!1},tooltip:{shared:!0,custom:function(t){var e=t.seriesIndex,i=t.dataPointIndex,a=t.w;return '<div class="apexcharts-tooltip-candlestick"><div>Open: <span class="value">'+a.globals.seriesCandleO[e][i]+'</span></div><div>High: <span class="value">'+a.globals.seriesCandleH[e][i]+'</span></div><div>Low: <span class="value">'+a.globals.seriesCandleL[e][i]+'</span></div><div>Close: <span class="value">'+a.globals.seriesCandleC[e][i]+"</span></div></div>"}},states:{active:{filter:{type:"none"}}},xaxis:{crosshairs:{width:1}}}}},{key:"rangeBar",value:function(){return {stroke:{width:0,lineCap:"square"},plotOptions:{bar:{dataLabels:{position:"center"}}},dataLabels:{enabled:!1,formatter:function(t,e){e.ctx;var i=e.seriesIndex,a=e.dataPointIndex,s=e.w,r=s.globals.seriesRangeStart[i][a];return s.globals.seriesRangeEnd[i][a]-r},background:{enabled:!1},style:{colors:["#fff"]}},tooltip:{shared:!1,followCursor:!0,custom:function(t){return t.w.config.plotOptions&&t.w.config.plotOptions.bar&&t.w.config.plotOptions.bar.horizontal?function(t){var e=new F(t.ctx,null),i=e.getTooltipValues(t),a=i.color,s=i.seriesName,r=i.ylabel,n=i.startVal,o=i.endVal;return e.buildCustomTooltipHTML({color:a,seriesName:s,ylabel:r,start:n,end:o})}(t):function(t){var e=new F(t.ctx,null),i=e.getTooltipValues(t),a=i.color,s=i.seriesName,r=i.ylabel,n=i.start,o=i.end;return e.buildCustomTooltipHTML({color:a,seriesName:s,ylabel:r,start:n,end:o})}(t)}},xaxis:{tickPlacement:"between",tooltip:{enabled:!1},crosshairs:{stroke:{width:0}}}}}},{key:"area",value:function(){return {stroke:{width:4},fill:{type:"gradient",gradient:{inverseColors:!1,shade:"light",type:"vertical",opacityFrom:.65,opacityTo:.5,stops:[0,100,100]}},markers:{size:0,hover:{sizeOffset:6}},tooltip:{followCursor:!1}}}},{key:"brush",value:function(t){return g.extend(t,{chart:{toolbar:{autoSelected:"selection",show:!1},zoom:{enabled:!1}},dataLabels:{enabled:!1},stroke:{width:1},tooltip:{enabled:!1},xaxis:{tooltip:{enabled:!1}}})}},{key:"stacked100",value:function(t){t.dataLabels=t.dataLabels||{},t.dataLabels.formatter=t.dataLabels.formatter||void 0;var e=t.dataLabels.formatter;return t.yaxis.forEach((function(e,i){t.yaxis[i].min=0,t.yaxis[i].max=100;})),"bar"===t.chart.type&&(t.dataLabels.formatter=e||function(t){return "number"==typeof t&&t?t.toFixed(0)+"%":t}),t}},{key:"convertCatToNumeric",value:function(t){return t.xaxis.convertedCatToNumeric=!0,t}},{key:"convertCatToNumericXaxis",value:function(t,e,i){t.xaxis.type="numeric",t.xaxis.labels=t.xaxis.labels||{},t.xaxis.labels.formatter=t.xaxis.labels.formatter||function(t){return g.isNumber(t)?Math.floor(t):t};var a=t.xaxis.labels.formatter,s=t.xaxis.categories&&t.xaxis.categories.length?t.xaxis.categories:t.labels;return i&&i.length&&(s=i.map((function(t){return t.toString()}))),s&&s.length&&(t.xaxis.labels.formatter=function(t){return g.isNumber(t)?a(s[Math.floor(t)-1]):a(t)}),t.xaxis.categories=[],t.labels=[],t.xaxis.tickAmount=t.xaxis.tickAmount||"dataPoints",t}},{key:"bubble",value:function(){return {dataLabels:{style:{colors:["#fff"]}},tooltip:{shared:!1,intersect:!0},xaxis:{crosshairs:{width:0}},fill:{type:"solid",gradient:{shade:"light",inverse:!0,shadeIntensity:.55,opacityFrom:.4,opacityTo:.8}}}}},{key:"scatter",value:function(){return {dataLabels:{enabled:!1},tooltip:{shared:!1,intersect:!0},markers:{size:6,strokeWidth:1,hover:{sizeOffset:2}}}}},{key:"heatmap",value:function(){return {chart:{stacked:!1},fill:{opacity:1},dataLabels:{style:{colors:["#fff"]}},stroke:{colors:["#fff"]},tooltip:{followCursor:!0,marker:{show:!1},x:{show:!1}},legend:{position:"top",markers:{shape:"square",size:10,offsetY:2}},grid:{padding:{right:20}}}}},{key:"pie",value:function(){return {chart:{toolbar:{show:!1}},plotOptions:{pie:{donut:{labels:{show:!1}}}},dataLabels:{formatter:function(t){return t.toFixed(1)+"%"},style:{colors:["#fff"]},dropShadow:{enabled:!0}},stroke:{colors:["#fff"]},fill:{opacity:1,gradient:{shade:"light",stops:[0,100]}},tooltip:{theme:"dark",fillSeriesColor:!0},legend:{position:"right"}}}},{key:"donut",value:function(){return {chart:{toolbar:{show:!1}},dataLabels:{formatter:function(t){return t.toFixed(1)+"%"},style:{colors:["#fff"]},dropShadow:{enabled:!0}},stroke:{colors:["#fff"]},fill:{opacity:1,gradient:{shade:"light",shadeIntensity:.35,stops:[80,100],opacityFrom:1,opacityTo:1}},tooltip:{theme:"dark",fillSeriesColor:!0},legend:{position:"right"}}}},{key:"polarArea",value:function(){return this.opts.yaxis[0].tickAmount=this.opts.yaxis[0].tickAmount?this.opts.yaxis[0].tickAmount:6,{chart:{toolbar:{show:!1}},dataLabels:{formatter:function(t){return t.toFixed(1)+"%"},enabled:!1},stroke:{show:!0,width:2},fill:{opacity:.7},tooltip:{theme:"dark",fillSeriesColor:!0},legend:{position:"right"}}}},{key:"radar",value:function(){return this.opts.yaxis[0].labels.offsetY=this.opts.yaxis[0].labels.offsetY?this.opts.yaxis[0].labels.offsetY:6,{dataLabels:{enabled:!1,style:{fontSize:"11px"}},stroke:{width:2},markers:{size:3,strokeWidth:1,strokeOpacity:1},fill:{opacity:.2},tooltip:{shared:!1,intersect:!0,followCursor:!0},grid:{show:!1},xaxis:{labels:{formatter:function(t){return t},style:{colors:["#a8a8a8"],fontSize:"11px"}},tooltip:{enabled:!1},crosshairs:{show:!1}}}}},{key:"radialBar",value:function(){return {chart:{animations:{dynamicAnimation:{enabled:!0,speed:800}},toolbar:{show:!1}},fill:{gradient:{shade:"dark",shadeIntensity:.4,inverseColors:!1,type:"diagonal2",opacityFrom:1,opacityTo:1,stops:[70,98,100]}},legend:{show:!1,position:"right"},tooltip:{enabled:!1,fillSeriesColor:!0}}}}]),t}(),D=function(){function i(t){e(this,i),this.opts=t;}return a(i,[{key:"init",value:function(e){var i=e.responsiveOverride,a=this.opts,s=new S,r=new R(a);this.chartType=a.chart.type,"histogram"===this.chartType&&(a.chart.type="bar",a=g.extend({plotOptions:{bar:{columnWidth:"99.99%"}}},a)),a=this.extendYAxis(a),a=this.extendAnnotations(a);var n=s.init(),o={};if(a&&"object"===t(a)){var l={};l=-1!==["line","area","bar","candlestick","rangeBar","histogram","bubble","scatter","heatmap","pie","polarArea","donut","radar","radialBar"].indexOf(a.chart.type)?r[a.chart.type]():r.line(),a.chart.brush&&a.chart.brush.enabled&&(l=r.brush(l)),a.chart.stacked&&"100%"===a.chart.stackType&&(a=r.stacked100(a)),this.checkForDarkTheme(window.Apex),this.checkForDarkTheme(a),a.xaxis=a.xaxis||window.Apex.xaxis||{},i||(a.xaxis.convertedCatToNumeric=!1),((a=this.checkForCatToNumericXAxis(this.chartType,l,a)).chart.sparkline&&a.chart.sparkline.enabled||window.Apex.chart&&window.Apex.chart.sparkline&&window.Apex.chart.sparkline.enabled)&&(l=r.sparkline(l)),o=g.extend(n,l);}var h=g.extend(o,window.Apex);return n=g.extend(h,a),n=this.handleUserInputErrors(n)}},{key:"checkForCatToNumericXAxis",value:function(t,e,i){var a=new R(i),s="bar"===t&&i.plotOptions&&i.plotOptions.bar&&i.plotOptions.bar.horizontal,r="pie"===t||"polarArea"===t||"donut"===t||"radar"===t||"radialBar"===t||"heatmap"===t,n="datetime"!==i.xaxis.type&&"numeric"!==i.xaxis.type,o=i.xaxis.tickPlacement?i.xaxis.tickPlacement:e.xaxis&&e.xaxis.tickPlacement;return s||r||!n||"between"===o||(i=a.convertCatToNumeric(i)),i}},{key:"extendYAxis",value:function(t,e){var i=new S;(void 0===t.yaxis||!t.yaxis||Array.isArray(t.yaxis)&&0===t.yaxis.length)&&(t.yaxis={}),t.yaxis.constructor!==Array&&window.Apex.yaxis&&window.Apex.yaxis.constructor!==Array&&(t.yaxis=g.extend(t.yaxis,window.Apex.yaxis)),t.yaxis.constructor!==Array?t.yaxis=[g.extend(i.yAxis,t.yaxis)]:t.yaxis=g.extendArray(t.yaxis,i.yAxis);var a=!1;t.yaxis.forEach((function(t){t.logarithmic&&(a=!0);}));var s=t.series;return e&&!s&&(s=e.config.series),a&&s.length!==t.yaxis.length&&s.length&&(t.yaxis=s.map((function(e,a){if(e.name||(s[a].name="series-".concat(a+1)),t.yaxis[a])return t.yaxis[a].seriesName=s[a].name,t.yaxis[a];var r=g.extend(i.yAxis,t.yaxis[0]);return r.show=!1,r}))),a&&s.length>1&&s.length!==t.yaxis.length&&console.warn("A multi-series logarithmic chart should have equal number of series and y-axes. Please make sure to equalize both."),t}},{key:"extendAnnotations",value:function(t){return void 0===t.annotations&&(t.annotations={},t.annotations.yaxis=[],t.annotations.xaxis=[],t.annotations.points=[]),t=this.extendYAxisAnnotations(t),t=this.extendXAxisAnnotations(t),t=this.extendPointAnnotations(t)}},{key:"extendYAxisAnnotations",value:function(t){var e=new S;return t.annotations.yaxis=g.extendArray(void 0!==t.annotations.yaxis?t.annotations.yaxis:[],e.yAxisAnnotation),t}},{key:"extendXAxisAnnotations",value:function(t){var e=new S;return t.annotations.xaxis=g.extendArray(void 0!==t.annotations.xaxis?t.annotations.xaxis:[],e.xAxisAnnotation),t}},{key:"extendPointAnnotations",value:function(t){var e=new S;return t.annotations.points=g.extendArray(void 0!==t.annotations.points?t.annotations.points:[],e.pointAnnotation),t}},{key:"checkForDarkTheme",value:function(t){t.theme&&"dark"===t.theme.mode&&(t.tooltip||(t.tooltip={}),"light"!==t.tooltip.theme&&(t.tooltip.theme="dark"),t.chart.foreColor||(t.chart.foreColor="#f6f7f8"),t.theme.palette||(t.theme.palette="palette4"));}},{key:"handleUserInputErrors",value:function(t){var e=t;if(e.tooltip.shared&&e.tooltip.intersect)throw new Error("tooltip.shared cannot be enabled when tooltip.intersect is true. Turn off any other option by setting it to false.");if(("bar"===e.chart.type||"rangeBar"===e.chart.type)&&e.plotOptions.bar.horizontal){if(e.yaxis.length>1)throw new Error("Multiple Y Axis for bars are not supported. Switch to column chart by setting plotOptions.bar.horizontal=false");e.yaxis[0].reversed&&(e.yaxis[0].opposite=!0),e.xaxis.tooltip.enabled=!1,e.yaxis[0].tooltip.enabled=!1,e.chart.zoom.enabled=!1;}return "bar"!==e.chart.type&&"rangeBar"!==e.chart.type||e.tooltip.shared&&("barWidth"===e.xaxis.crosshairs.width&&e.series.length>1&&(console.warn('crosshairs.width = "barWidth" is only supported in single series, not in a multi-series barChart.'),e.xaxis.crosshairs.width="tickWidth"),e.plotOptions.bar.horizontal&&(e.states.hover.type="none",e.tooltip.shared=!1),e.tooltip.followCursor||(console.warn("followCursor option in shared columns cannot be turned off. Please set %ctooltip.followCursor: true","color: blue;"),e.tooltip.followCursor=!0)),"candlestick"===e.chart.type&&e.yaxis[0].reversed&&(console.warn("Reversed y-axis in candlestick chart is not supported."),e.yaxis[0].reversed=!1),e.chart.group&&0===e.yaxis[0].labels.minWidth&&console.warn("It looks like you have multiple charts in synchronization. You must provide yaxis.labels.minWidth which must be EQUAL for all grouped charts to prevent incorrect behaviour."),Array.isArray(e.stroke.width)&&"line"!==e.chart.type&&"area"!==e.chart.type&&(console.warn("stroke.width option accepts array only for line and area charts. Reverted back to Number"),e.stroke.width=e.stroke.width[0]),e}}]),i}(),H=function(){function t(){e(this,t);}return a(t,[{key:"initGlobalVars",value:function(t){t.series=[],t.seriesCandleO=[],t.seriesCandleH=[],t.seriesCandleL=[],t.seriesCandleC=[],t.seriesRangeStart=[],t.seriesRangeEnd=[],t.seriesRangeBarTimeline=[],t.seriesPercent=[],t.seriesX=[],t.seriesZ=[],t.seriesNames=[],t.seriesTotals=[],t.seriesLog=[],t.stackedSeriesTotals=[],t.seriesXvalues=[],t.seriesYvalues=[],t.labels=[],t.categoryLabels=[],t.timescaleLabels=[],t.noLabelsProvided=!1,t.resizeTimer=null,t.selectionResizeTimer=null,t.delayedElements=[],t.pointsArray=[],t.dataLabelsRects=[],t.isXNumeric=!1,t.xaxisLabelsCount=0,t.skipLastTimelinelabel=!1,t.skipFirstTimelinelabel=!1,t.isDataXYZ=!1,t.isMultiLineX=!1,t.isMultipleYAxis=!1,t.maxY=-Number.MAX_VALUE,t.minY=Number.MIN_VALUE,t.minYArr=[],t.maxYArr=[],t.maxX=-Number.MAX_VALUE,t.minX=Number.MAX_VALUE,t.initialMaxX=-Number.MAX_VALUE,t.initialMinX=Number.MAX_VALUE,t.maxDate=0,t.minDate=Number.MAX_VALUE,t.minZ=Number.MAX_VALUE,t.maxZ=-Number.MAX_VALUE,t.minXDiff=Number.MAX_VALUE,t.yAxisScale=[],t.xAxisScale=null,t.xAxisTicksPositions=[],t.yLabelsCoords=[],t.yTitleCoords=[],t.barPadForNumericAxis=0,t.padHorizontal=0,t.xRange=0,t.yRange=[],t.zRange=0,t.dataPoints=0,t.xTickAmount=0;}},{key:"globalVars",value:function(t){return {chartID:null,cuid:null,events:{beforeMount:[],mounted:[],updated:[],clicked:[],selection:[],dataPointSelection:[],zoomed:[],scrolled:[]},colors:[],clientX:null,clientY:null,fill:{colors:[]},stroke:{colors:[]},dataLabels:{style:{colors:[]}},radarPolygons:{fill:{colors:[]}},markers:{colors:[],size:t.markers.size,largestSize:0},animationEnded:!1,isTouchDevice:"ontouchstart"in window||navigator.msMaxTouchPoints,isDirty:!1,isExecCalled:!1,initialConfig:null,initialSeries:[],lastXAxis:[],lastYAxis:[],columnSeries:null,labels:[],timescaleLabels:[],noLabelsProvided:!1,allSeriesCollapsed:!1,collapsedSeries:[],collapsedSeriesIndices:[],ancillaryCollapsedSeries:[],ancillaryCollapsedSeriesIndices:[],risingSeries:[],dataFormatXNumeric:!1,capturedSeriesIndex:-1,capturedDataPointIndex:-1,selectedDataPoints:[],goldenPadding:35,invalidLogScale:!1,ignoreYAxisIndexes:[],yAxisSameScaleIndices:[],maxValsInArrayIndex:0,radialSize:0,selection:void 0,zoomEnabled:"zoom"===t.chart.toolbar.autoSelected&&t.chart.toolbar.tools.zoom&&t.chart.zoom.enabled,panEnabled:"pan"===t.chart.toolbar.autoSelected&&t.chart.toolbar.tools.pan,selectionEnabled:"selection"===t.chart.toolbar.autoSelected&&t.chart.toolbar.tools.selection,yaxis:null,mousedown:!1,lastClientPosition:{},visibleXRange:void 0,yValueDecimal:0,total:0,SVGNS:"http://www.w3.org/2000/svg",svgWidth:0,svgHeight:0,noData:!1,locale:{},dom:{},memory:{methodsToExec:[]},shouldAnimate:!0,skipLastTimelinelabel:!1,skipFirstTimelinelabel:!1,delayedElements:[],axisCharts:!0,isDataXYZ:!1,resized:!1,resizeTimer:null,comboCharts:!1,dataChanged:!1,previousPaths:[],allSeriesHasEqualX:!0,pointsArray:[],dataLabelsRects:[],lastDrawnDataLabelsIndexes:[],hasNullValues:!1,easing:null,zoomed:!1,gridWidth:0,gridHeight:0,rotateXLabels:!1,defaultLabels:!1,xLabelFormatter:void 0,yLabelFormatters:[],xaxisTooltipFormatter:void 0,ttKeyFormatter:void 0,ttVal:void 0,ttZFormatter:void 0,LINE_HEIGHT_RATIO:1.618,xAxisLabelsHeight:0,yAxisLabelsWidth:0,scaleX:1,scaleY:1,translateX:0,translateY:0,translateYAxisX:[],yAxisWidths:[],translateXAxisY:0,translateXAxisX:0,tooltip:null}}},{key:"init",value:function(t){var e=this.globalVars(t);return this.initGlobalVars(e),e.initialConfig=g.extend({},t),e.initialSeries=g.clone(t.series),e.lastXAxis=JSON.parse(JSON.stringify(e.initialConfig.xaxis)),e.lastYAxis=JSON.parse(JSON.stringify(e.initialConfig.yaxis)),e}}]),t}(),N=function(){function t(i){e(this,t),this.opts=i;}return a(t,[{key:"init",value:function(){var t=new D(this.opts).init({responsiveOverride:!1});return {config:t,globals:(new H).init(t)}}}]),t}(),O=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.twoDSeries=[],this.threeDSeries=[],this.twoDSeriesX=[],this.coreUtils=new m(this.ctx);}return a(t,[{key:"isMultiFormat",value:function(){return this.isFormatXY()||this.isFormat2DArray()}},{key:"isFormatXY",value:function(){var t=this.w.config.series.slice(),e=new M(this.ctx);if(this.activeSeriesIndex=e.getActiveConfigSeriesIndex(),void 0!==t[this.activeSeriesIndex].data&&t[this.activeSeriesIndex].data.length>0&&null!==t[this.activeSeriesIndex].data[0]&&void 0!==t[this.activeSeriesIndex].data[0].x&&null!==t[this.activeSeriesIndex].data[0])return !0}},{key:"isFormat2DArray",value:function(){var t=this.w.config.series.slice(),e=new M(this.ctx);if(this.activeSeriesIndex=e.getActiveConfigSeriesIndex(),void 0!==t[this.activeSeriesIndex].data&&t[this.activeSeriesIndex].data.length>0&&void 0!==t[this.activeSeriesIndex].data[0]&&null!==t[this.activeSeriesIndex].data[0]&&t[this.activeSeriesIndex].data[0].constructor===Array)return !0}},{key:"handleFormat2DArray",value:function(t,e){var i=this.w.config,a=this.w.globals;i.xaxis.sorted&&("datetime"===i.xaxis.type?t[e].data.sort((function(t,e){return new Date(t[0]).getTime()-new Date(e[0]).getTime()})):"numeric"===i.xaxis.type&&t[e].data.sort((function(t,e){return t[0]-e[0]})));for(var s=0;s<t[e].data.length;s++)if(void 0!==t[e].data[s][1]&&(Array.isArray(t[e].data[s][1])&&4===t[e].data[s][1].length?this.twoDSeries.push(g.parseNumber(t[e].data[s][1][3])):5===t[e].data[s].length?this.twoDSeries.push(g.parseNumber(t[e].data[s][4])):this.twoDSeries.push(g.parseNumber(t[e].data[s][1])),a.dataFormatXNumeric=!0),"datetime"===i.xaxis.type){var r=new Date(t[e].data[s][0]);r=new Date(r).getTime(),this.twoDSeriesX.push(r);}else this.twoDSeriesX.push(t[e].data[s][0]);for(var n=0;n<t[e].data.length;n++)void 0!==t[e].data[n][2]&&(this.threeDSeries.push(t[e].data[n][2]),a.isDataXYZ=!0);}},{key:"handleFormatXY",value:function(t,e){var i=this.w.config,a=this.w.globals,s=new Y(this.ctx),r=e;a.collapsedSeriesIndices.indexOf(e)>-1&&(r=this.activeSeriesIndex),i.xaxis.sorted&&("datetime"===i.xaxis.type?t[e].data.sort((function(t,e){return new Date(t.x).getTime()-new Date(e.x).getTime()})):"numeric"===i.xaxis.type&&t[e].data.sort((function(t,e){return t.x-e.x})));for(var n=0;n<t[e].data.length;n++)void 0!==t[e].data[n].y&&(Array.isArray(t[e].data[n].y)?this.twoDSeries.push(g.parseNumber(t[e].data[n].y[t[e].data[n].y.length-1])):this.twoDSeries.push(g.parseNumber(t[e].data[n].y)));for(var o=0;o<t[r].data.length;o++){var l="string"==typeof t[r].data[o].x,h=Array.isArray(t[r].data[o].x),c=!h&&!!s.isValidDate(t[r].data[o].x.toString());if(l||c)if(l||i.xaxis.convertedCatToNumeric){var d=a.isBarHorizontal&&a.isRangeData;"datetime"!==i.xaxis.type||d?(this.fallbackToCategory=!0,this.twoDSeriesX.push(t[r].data[o].x)):this.twoDSeriesX.push(s.parseDate(t[r].data[o].x));}else "datetime"===i.xaxis.type?this.twoDSeriesX.push(s.parseDate(t[r].data[o].x.toString())):(a.dataFormatXNumeric=!0,a.isXNumeric=!0,this.twoDSeriesX.push(parseFloat(t[r].data[o].x)));else h?(this.fallbackToCategory=!0,this.twoDSeriesX.push(t[r].data[o].x)):(a.isXNumeric=!0,a.dataFormatXNumeric=!0,this.twoDSeriesX.push(t[r].data[o].x));}if(t[e].data[0]&&void 0!==t[e].data[0].z){for(var u=0;u<t[e].data.length;u++)this.threeDSeries.push(t[e].data[u].z);a.isDataXYZ=!0;}}},{key:"handleRangeData",value:function(t,e){var i=this.w.config,a=this.w.globals,s={};return this.isFormat2DArray()?s=this.handleRangeDataFormat("array",t,e):this.isFormatXY()&&(s=this.handleRangeDataFormat("xy",t,e)),a.seriesRangeStart.push(s.start),a.seriesRangeEnd.push(s.end),"datetime"===i.xaxis.type&&a.seriesRangeBarTimeline.push(s.rangeUniques),a.seriesRangeBarTimeline.forEach((function(t,e){t&&t.forEach((function(t,e){t.y.forEach((function(e,i){for(var a=0;a<t.y.length;a++)if(i!==a){var s=e.y1,r=e.y2,n=t.y[a].y1;s<=t.y[a].y2&&n<=r&&(t.overlaps.indexOf(e.rangeName)<0&&t.overlaps.push(e.rangeName),t.overlaps.indexOf(t.y[a].rangeName)<0&&t.overlaps.push(t.y[a].rangeName));}}));}));})),s}},{key:"handleCandleStickData",value:function(t,e){var i=this.w.globals,a={};return this.isFormat2DArray()?a=this.handleCandleStickDataFormat("array",t,e):this.isFormatXY()&&(a=this.handleCandleStickDataFormat("xy",t,e)),i.seriesCandleO[e]=a.o,i.seriesCandleH[e]=a.h,i.seriesCandleL[e]=a.l,i.seriesCandleC[e]=a.c,a}},{key:"handleRangeDataFormat",value:function(t,e,i){var a=[],s=[],r=e[i].data.filter((function(t,e,i){return e===i.findIndex((function(e){return e.x===t.x}))})).map((function(t,e){return {x:t.x,overlaps:[],y:[]}})),n="Please provide [Start, End] values in valid format. Read more https://apexcharts.com/docs/series/#rangecharts",o=new M(this.ctx).getActiveConfigSeriesIndex();if("array"===t){if(2!==e[o].data[0][1].length)throw new Error(n);for(var l=0;l<e[i].data.length;l++)a.push(e[i].data[l][1][0]),s.push(e[i].data[l][1][1]);}else if("xy"===t){if(2!==e[o].data[0].y.length)throw new Error(n);for(var h=function(t){var n=g.randomId(),o=e[i].data[t].x,l={y1:e[i].data[t].y[0],y2:e[i].data[t].y[1],rangeName:n};e[i].data[t].rangeName=n;var h=r.findIndex((function(t){return t.x===o}));r[h].y.push(l),a.push(l.y1),s.push(l.y2);},c=0;c<e[i].data.length;c++)h(c);}return {start:a,end:s,rangeUniques:r}}},{key:"handleCandleStickDataFormat",value:function(t,e,i){var a=[],s=[],r=[],n=[],o="Please provide [Open, High, Low and Close] values in valid format. Read more https://apexcharts.com/docs/series/#candlestick";if("array"===t){if(!Array.isArray(e[i].data[0][1])&&5!==e[i].data[0].length||Array.isArray(e[i].data[0][1])&&4!==e[i].data[0][1].length)throw new Error(o);if(5===e[i].data[0].length)for(var l=0;l<e[i].data.length;l++)a.push(e[i].data[l][1]),s.push(e[i].data[l][2]),r.push(e[i].data[l][3]),n.push(e[i].data[l][4]);else for(var h=0;h<e[i].data.length;h++)a.push(e[i].data[h][1][0]),s.push(e[i].data[h][1][1]),r.push(e[i].data[h][1][2]),n.push(e[i].data[h][1][3]);}else if("xy"===t){if(4!==e[i].data[0].y.length)throw new Error(o);for(var c=0;c<e[i].data.length;c++)a.push(e[i].data[c].y[0]),s.push(e[i].data[c].y[1]),r.push(e[i].data[c].y[2]),n.push(e[i].data[c].y[3]);}return {o:a,h:s,l:r,c:n}}},{key:"parseDataAxisCharts",value:function(t){for(var e=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.ctx,a=this.w.config,s=this.w.globals,r=new Y(i),n=a.labels.length>0?a.labels.slice():a.xaxis.categories.slice(),o=function(){for(var t=0;t<n.length;t++)if("string"==typeof n[t]){if(!r.isValidDate(n[t]))throw new Error("You have provided invalid Date format. Please provide a valid JavaScript Date");e.twoDSeriesX.push(r.parseDate(n[t]));}else {if(13!==String(n[t]).length)throw new Error("Please provide a valid JavaScript timestamp");e.twoDSeriesX.push(n[t]);}},l=0;l<t.length;l++){if(this.twoDSeries=[],this.twoDSeriesX=[],this.threeDSeries=[],void 0===t[l].data)return void console.error("It is a possibility that you may have not included 'data' property in series.");if("rangeBar"!==a.chart.type&&"rangeArea"!==a.chart.type&&"rangeBar"!==t[l].type&&"rangeArea"!==t[l].type||(s.isRangeData=!0,this.handleRangeData(t,l)),this.isMultiFormat())this.isFormat2DArray()?this.handleFormat2DArray(t,l):this.isFormatXY()&&this.handleFormatXY(t,l),"candlestick"!==a.chart.type&&"candlestick"!==t[l].type||this.handleCandleStickData(t,l),s.series.push(this.twoDSeries),s.labels.push(this.twoDSeriesX),s.seriesX.push(this.twoDSeriesX),l!==this.activeSeriesIndex||this.fallbackToCategory||(s.isXNumeric=!0);else {"datetime"===a.xaxis.type?(s.isXNumeric=!0,o(),s.seriesX.push(this.twoDSeriesX)):"numeric"===a.xaxis.type&&(s.isXNumeric=!0,n.length>0&&(this.twoDSeriesX=n,s.seriesX.push(this.twoDSeriesX))),s.labels.push(this.twoDSeriesX);var h=t[l].data.map((function(t){return g.parseNumber(t)}));s.series.push(h);}s.seriesZ.push(this.threeDSeries),void 0!==t[l].name?s.seriesNames.push(t[l].name):s.seriesNames.push("series-"+parseInt(l+1,10));}return this.w}},{key:"parseDataNonAxisCharts",value:function(t){var e=this.w.globals,i=this.w.config;e.series=t.slice(),e.seriesNames=i.labels.slice();for(var a=0;a<e.series.length;a++)void 0===e.seriesNames[a]&&e.seriesNames.push("series-"+(a+1));return this.w}},{key:"handleExternalLabelsData",value:function(t){var e=this.w.config,i=this.w.globals;if(e.xaxis.categories.length>0)i.labels=e.xaxis.categories;else if(e.labels.length>0)i.labels=e.labels.slice();else if(this.fallbackToCategory){if(i.labels=i.labels[0],i.seriesRangeBarTimeline.length&&(i.seriesRangeBarTimeline.map((function(t){t.forEach((function(t){i.labels.indexOf(t.x)<0&&t.x&&i.labels.push(t.x);}));})),i.labels=i.labels.filter((function(t,e,i){return i.indexOf(t)===e}))),e.xaxis.convertedCatToNumeric)new R(e).convertCatToNumericXaxis(e,this.ctx,i.seriesX[0]),this._generateExternalLabels(t);}else this._generateExternalLabels(t);}},{key:"_generateExternalLabels",value:function(t){var e=this.w.globals,i=this.w.config,a=[];if(e.axisCharts){if(e.series.length>0)for(var s=0;s<e.series[e.maxValsInArrayIndex].length;s++)a.push(s+1);e.seriesX=[];for(var r=0;r<t.length;r++)e.seriesX.push(a);e.isXNumeric=!0;}if(0===a.length){a=e.axisCharts?[]:e.series.map((function(t,e){return e+1}));for(var n=0;n<t.length;n++)e.seriesX.push(a);}e.labels=a,i.xaxis.convertedCatToNumeric&&(e.categoryLabels=a.map((function(t){return i.xaxis.labels.formatter(t)}))),e.noLabelsProvided=!0;}},{key:"parseData",value:function(t){var e=this.w,i=e.config,a=e.globals;if(this.excludeCollapsedSeriesInYAxis(),this.fallbackToCategory=!1,this.ctx.core.resetGlobals(),this.ctx.core.isMultipleY(),a.axisCharts?this.parseDataAxisCharts(t):this.parseDataNonAxisCharts(t),this.coreUtils.getLargestSeries(),"bar"===i.chart.type&&i.chart.stacked){var s=new M(this.ctx);a.series=s.setNullSeriesToZeroValues(a.series);}this.coreUtils.getSeriesTotals(),a.axisCharts&&this.coreUtils.getStackedSeriesTotals(),this.coreUtils.getPercentSeries(),a.dataFormatXNumeric||a.isXNumeric&&("numeric"!==i.xaxis.type||0!==i.labels.length||0!==i.xaxis.categories.length)||this.handleExternalLabelsData(t);for(var r=this.coreUtils.getCategoryLabels(a.labels),n=0;n<r.length;n++)if(Array.isArray(r[n])){a.isMultiLineX=!0;break}}},{key:"excludeCollapsedSeriesInYAxis",value:function(){var t=this,e=this.w;e.globals.ignoreYAxisIndexes=e.globals.collapsedSeries.map((function(i,a){if(t.w.globals.isMultipleYAxis&&!e.config.chart.stacked)return i.index}));}}]),t}(),W=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.tooltipKeyFormat="dd MMM";}return a(t,[{key:"xLabelFormat",value:function(t,e,i){var a=this.w;if("datetime"===a.config.xaxis.type&&void 0===a.config.xaxis.labels.formatter&&void 0===a.config.tooltip.x.formatter){var s=new Y(this.ctx);return s.formatDate(s.getDate(e),a.config.tooltip.x.format)}return t(e,i)}},{key:"defaultGeneralFormatter",value:function(t){return Array.isArray(t)?t.map((function(t){return t})):t}},{key:"defaultYFormatter",value:function(t,e,i){var a=this.w;return g.isNumber(t)&&(t=0!==a.globals.yValueDecimal?t.toFixed(void 0!==e.decimalsInFloat?e.decimalsInFloat:a.globals.yValueDecimal):a.globals.maxYArr[i]-a.globals.minYArr[i]<10?t.toFixed(1):t.toFixed(0)),t}},{key:"setLabelFormatters",value:function(){var t=this,e=this.w;return e.globals.xLabelFormatter=function(e){return t.defaultGeneralFormatter(e)},e.globals.xaxisTooltipFormatter=function(e){return t.defaultGeneralFormatter(e)},e.globals.ttKeyFormatter=function(e){return t.defaultGeneralFormatter(e)},e.globals.ttZFormatter=function(t){return t},e.globals.legendFormatter=function(e){return t.defaultGeneralFormatter(e)},void 0!==e.config.xaxis.labels.formatter?e.globals.xLabelFormatter=e.config.xaxis.labels.formatter:e.globals.xLabelFormatter=function(t){if(g.isNumber(t)){if(!e.config.xaxis.convertedCatToNumeric&&"numeric"===e.config.xaxis.type&&e.globals.dataPoints<50)return t.toFixed(1);if(e.globals.isBarHorizontal)if(e.globals.maxY-e.globals.minYArr<4)return t.toFixed(1);return t.toFixed(0)}return t},"function"==typeof e.config.tooltip.x.formatter?e.globals.ttKeyFormatter=e.config.tooltip.x.formatter:e.globals.ttKeyFormatter=e.globals.xLabelFormatter,"function"==typeof e.config.xaxis.tooltip.formatter&&(e.globals.xaxisTooltipFormatter=e.config.xaxis.tooltip.formatter),Array.isArray(e.config.tooltip.y)?e.globals.ttVal=e.config.tooltip.y:void 0!==e.config.tooltip.y.formatter&&(e.globals.ttVal=e.config.tooltip.y),void 0!==e.config.tooltip.z.formatter&&(e.globals.ttZFormatter=e.config.tooltip.z.formatter),void 0!==e.config.legend.formatter&&(e.globals.legendFormatter=e.config.legend.formatter),e.config.yaxis.forEach((function(i,a){void 0!==i.labels.formatter?e.globals.yLabelFormatters[a]=i.labels.formatter:e.globals.yLabelFormatters[a]=function(s){return e.globals.xyCharts?Array.isArray(s)?s.map((function(e){return t.defaultYFormatter(e,i,a)})):t.defaultYFormatter(s,i,a):s};})),e.globals}},{key:"heatmapLabelFormatters",value:function(){var t=this.w;if("heatmap"===t.config.chart.type){t.globals.yAxisScale[0].result=t.globals.seriesNames.slice();var e=t.globals.seriesNames.reduce((function(t,e){return t.length>e.length?t:e}),0);t.globals.yAxisScale[0].niceMax=e,t.globals.yAxisScale[0].niceMin=e;}}}]),t}(),B=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"getLabel",value:function(t,e,i,a){var s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:[],r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"12px",n=this.w,o=void 0===t[a]?"":t[a],l=o,h=n.globals.xLabelFormatter,c=n.config.xaxis.labels.formatter,d=!1,g=new W(this.ctx),u=o;l=g.xLabelFormat(h,o,u),void 0!==c&&(l=c(o,t[a],a));var f=function(t){var i=null;return e.forEach((function(t){"month"===t.unit?i="year":"day"===t.unit?i="month":"hour"===t.unit?i="day":"minute"===t.unit&&(i="hour");})),i===t};e.length>0?(d=f(e[a].unit),i=e[a].position,l=e[a].value):"datetime"===n.config.xaxis.type&&void 0===c&&(l=""),void 0===l&&(l=""),l=Array.isArray(l)?l:l.toString();var x=new p(this.ctx),b={};return b=n.globals.rotateXLabels?x.getTextRects(l,parseInt(r,10),null,"rotate(".concat(n.config.xaxis.labels.rotate," 0 0)"),!1):x.getTextRects(l,parseInt(r,10)),!Array.isArray(l)&&(0===l.indexOf("NaN")||0===l.toLowerCase().indexOf("invalid")||l.toLowerCase().indexOf("infinity")>=0||s.indexOf(l)>=0&&!n.config.xaxis.labels.showDuplicates)&&(l=""),{x:i,text:l,textRect:b,isBold:d}}},{key:"checkForOverflowingLabels",value:function(t,e,i,a,s){var r=this.w;if(0===t&&r.globals.skipFirstTimelinelabel&&(e.text=""),t===i-1&&r.globals.skipLastTimelinelabel&&(e.text=""),r.config.xaxis.labels.hideOverlappingLabels&&a.length>0){var n=s[s.length-1];e.x<n.textRect.width/(r.globals.rotateXLabels?Math.abs(r.config.xaxis.labels.rotate)/12:1.01)+n.x&&(e.text="");}return e}},{key:"checkForReversedLabels",value:function(t,e){var i=this.w;return i.config.yaxis[t]&&i.config.yaxis[t].reversed&&e.reverse(),e}},{key:"isYAxisHidden",value:function(t){var e=this.w,i=new m(this.ctx);return !e.config.yaxis[t].show||!e.config.yaxis[t].showForNullSeries&&i.isSeriesNull(t)&&-1===e.globals.collapsedSeriesIndices.indexOf(t)}},{key:"drawYAxisTicks",value:function(t,e,i,a,s,r,n){var o=this.w,l=new p(this.ctx),h=o.globals.translateY;if(a.show&&e>0){!0===o.config.yaxis[s].opposite&&(t+=a.width);for(var c=e;c>=0;c--){var d=h+e/10+o.config.yaxis[s].labels.offsetY-1;o.globals.isBarHorizontal&&(d=r*c),"heatmap"===o.config.chart.type&&(d+=r/2);var g=l.drawLine(t+i.offsetX-a.width+a.offsetX,d+a.offsetY,t+i.offsetX+a.offsetX,d+a.offsetY,a.color);n.add(g),h+=r;}}}}]),t}(),V=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"fixSvgStringForIe11",value:function(t){if(!g.isIE11())return t;var e=0,i=t.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g,(function(t){return 2===++e?'xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"':t}));return i=(i=i.replace(/xmlns:NS\d+=""/g,"")).replace(/NS\d+:(\w+:\w+=")/g,"$1")}},{key:"getSvgString",value:function(){var t=this.w.globals.dom.Paper.svg();return this.fixSvgStringForIe11(t)}},{key:"cleanup",value:function(){var t=this.w,e=t.globals.dom.baseEl.getElementsByClassName("apexcharts-xcrosshairs"),i=t.globals.dom.baseEl.getElementsByClassName("apexcharts-ycrosshairs"),a=t.globals.dom.baseEl.querySelectorAll(".apexcharts-zoom-rect, .apexcharts-selection-rect");Array.prototype.forEach.call(a,(function(t){t.setAttribute("width",0);})),e&&e[0]&&(e[0].setAttribute("x",-500),e[0].setAttribute("x1",-500),e[0].setAttribute("x2",-500)),i&&i[0]&&(i[0].setAttribute("y",-100),i[0].setAttribute("y1",-100),i[0].setAttribute("y2",-100));}},{key:"svgUrl",value:function(){this.cleanup();var t=this.getSvgString(),e=new Blob([t],{type:"image/svg+xml;charset=utf-8"});return URL.createObjectURL(e)}},{key:"dataURI",value:function(){var t=this;return new Promise((function(e){var i=t.w;t.cleanup();var a=document.createElement("canvas");a.width=i.globals.svgWidth,a.height=parseInt(i.globals.dom.elWrap.style.height,10);var s="transparent"===i.config.chart.background?"#fff":i.config.chart.background,r=a.getContext("2d");r.fillStyle=s,r.fillRect(0,0,a.width,a.height);var n=t.getSvgString();if(window.canvg&&g.isIE11()){var o=window.canvg.Canvg.fromString(r,n,{ignoreClear:!0,ignoreDimensions:!0});o.start();var l=a.msToBlob();o.stop(),e({blob:l});}else {var h="data:image/svg+xml,"+encodeURIComponent(n),c=new Image;c.crossOrigin="anonymous",c.onload=function(){if(r.drawImage(c,0,0),a.msToBlob){var t=a.msToBlob();e({blob:t});}else {var i=a.toDataURL("image/png");e({imgURI:i});}},c.src=h;}}))}},{key:"exportToSVG",value:function(){this.triggerDownload(this.svgUrl(),".svg");}},{key:"exportToPng",value:function(){var t=this;this.dataURI().then((function(e){var i=e.imgURI,a=e.blob;a?navigator.msSaveOrOpenBlob(a,t.w.globals.chartID+".png"):t.triggerDownload(i,".png");}));}},{key:"exportToCSV",value:function(t){var e=this,i=t.series,a=t.columnDelimiter,s=void 0===a?",":a,r=t.lineDelimiter,n=void 0===r?"\n":r,o=this.w,l=[],h=[],c="data:text/csv;charset=utf-8,",d=new O(this.ctx),g=new B(this.ctx),u=function(t){var i="";if(o.globals.axisCharts){if("category"===o.config.xaxis.type||o.config.xaxis.convertedCatToNumeric)if(o.globals.isBarHorizontal){var a=o.globals.yLabelFormatters[0],s=new M(e.ctx).getActiveConfigSeriesIndex();i=a(o.globals.labels[t],{seriesIndex:s,dataPointIndex:t,w:o});}else i=g.getLabel(o.globals.labels,o.globals.timescaleLabels,0,t).text;"datetime"===o.config.xaxis.type&&(o.config.xaxis.categories.length?i=o.config.xaxis.categories[t]:o.config.labels.length&&(i=o.config.labels[t]));}else i=o.config.labels[t];return i};l.push("category"),i.map((function(t,e){o.globals.axisCharts&&l.push(t.name?t.name:"series-".concat(e));})),o.globals.axisCharts||(l.push("value"),h.push(l.join(s))),i.map((function(t,e){o.globals.axisCharts?function(t,e){if(l.length&&0===e&&h.push(l.join(s)),t.data&&t.data.length)for(var a=0;a<t.data.length;a++){l=[];var r=u(a);if(r||(d.isFormatXY()?r=i[e].data[a].x:d.isFormat2DArray()&&(r=i[e].data[a]?i[e].data[a][0]:"")),0===e){l.push(r);for(var n=0;n<o.globals.series.length;n++)l.push(o.globals.series[n][a]);}("candlestick"===o.config.chart.type||t.type&&"candlestick"===t.type)&&(l.pop(),l.push(o.globals.seriesCandleO[e][a]),l.push(o.globals.seriesCandleH[e][a]),l.push(o.globals.seriesCandleL[e][a]),l.push(o.globals.seriesCandleC[e][a])),"rangeBar"===o.config.chart.type&&(l.pop(),l.push(o.globals.seriesRangeStart[e][a]),l.push(o.globals.seriesRangeEnd[e][a])),l.length&&h.push(l.join(s));}}(t,e):((l=[]).push(o.globals.labels[e]),l.push(o.globals.series[e]),h.push(l.join(s)));})),c+=h.join(n),this.triggerDownload(encodeURI(c),".csv");}},{key:"triggerDownload",value:function(t,e){var i=document.createElement("a");i.href=t,i.download=this.w.globals.chartID+e,document.body.appendChild(i),i.click(),document.body.removeChild(i);}}]),t}(),G=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;var a=this.w;this.axesUtils=new B(i),this.xaxisLabels=a.globals.labels.slice(),a.globals.timescaleLabels.length>0&&!a.globals.isBarHorizontal&&(this.xaxisLabels=a.globals.timescaleLabels.slice()),this.drawnLabels=[],this.drawnLabelsRects=[],"top"===a.config.xaxis.position?this.offY=0:this.offY=a.globals.gridHeight+1,this.offY=this.offY+a.config.xaxis.axisBorder.offsetY,this.isCategoryBarHorizontal="bar"===a.config.chart.type&&a.config.plotOptions.bar.horizontal,this.xaxisFontSize=a.config.xaxis.labels.style.fontSize,this.xaxisFontFamily=a.config.xaxis.labels.style.fontFamily,this.xaxisForeColors=a.config.xaxis.labels.style.colors,this.xaxisBorderWidth=a.config.xaxis.axisBorder.width,this.isCategoryBarHorizontal&&(this.xaxisBorderWidth=a.config.yaxis[0].axisBorder.width.toString()),this.xaxisBorderWidth.indexOf("%")>-1?this.xaxisBorderWidth=a.globals.gridWidth*parseInt(this.xaxisBorderWidth,10)/100:this.xaxisBorderWidth=parseInt(this.xaxisBorderWidth,10),this.xaxisBorderHeight=a.config.xaxis.axisBorder.height,this.yaxis=a.config.yaxis[0];}return a(t,[{key:"drawXaxis",value:function(){var t,e=this,i=this.w,a=new p(this.ctx),s=a.group({class:"apexcharts-xaxis",transform:"translate(".concat(i.config.xaxis.offsetX,", ").concat(i.config.xaxis.offsetY,")")}),r=a.group({class:"apexcharts-xaxis-texts-g",transform:"translate(".concat(i.globals.translateXAxisX,", ").concat(i.globals.translateXAxisY,")")});s.add(r);for(var n=i.globals.padHorizontal,o=[],l=0;l<this.xaxisLabels.length;l++)o.push(this.xaxisLabels[l]);var h=o.length;if(i.globals.isXNumeric){var c=h>1?h-1:h;t=i.globals.gridWidth/c,n=n+t/2+i.config.xaxis.labels.offsetX;}else t=i.globals.gridWidth/o.length,n=n+t+i.config.xaxis.labels.offsetX;if(i.config.xaxis.labels.show)for(var d=function(s){var l=n-t/2+i.config.xaxis.labels.offsetX;0===s&&1===h&&t/2===n&&1===i.globals.dataPoints&&(l=i.globals.gridWidth/2);var c=e.axesUtils.getLabel(o,i.globals.timescaleLabels,l,s,e.drawnLabels,e.xaxisFontSize),d=28;i.globals.rotateXLabels&&(d=22);(c=e.axesUtils.checkForOverflowingLabels(s,c,h,e.drawnLabels,e.drawnLabelsRects)).text&&i.globals.xaxisLabelsCount++;var g=a.drawText({x:c.x,y:e.offY+i.config.xaxis.labels.offsetY+d-("top"===i.config.xaxis.position?i.globals.xAxisHeight+i.config.xaxis.axisTicks.height-2:0),text:c.text,textAnchor:"middle",fontWeight:c.isBold?600:i.config.xaxis.labels.style.fontWeight,fontSize:e.xaxisFontSize,fontFamily:e.xaxisFontFamily,foreColor:Array.isArray(e.xaxisForeColors)?i.config.xaxis.convertedCatToNumeric?e.xaxisForeColors[i.globals.minX+s-1]:e.xaxisForeColors[s]:e.xaxisForeColors,isPlainText:!1,cssClass:"apexcharts-xaxis-label "+i.config.xaxis.labels.style.cssClass});r.add(g);var u=document.createElementNS(i.globals.SVGNS,"title");u.textContent=c.text,g.node.appendChild(u),""!==c.text&&(e.drawnLabels.push(c.text),e.drawnLabelsRects.push(c)),n+=t;},g=0;g<=h-1;g++)d(g);if(void 0!==i.config.xaxis.title.text){var u=a.group({class:"apexcharts-xaxis-title"}),f=a.drawText({x:i.globals.gridWidth/2+i.config.xaxis.title.offsetX,y:this.offY-parseFloat(this.xaxisFontSize)+i.globals.xAxisLabelsHeight+i.config.xaxis.title.offsetY,text:i.config.xaxis.title.text,textAnchor:"middle",fontSize:i.config.xaxis.title.style.fontSize,fontFamily:i.config.xaxis.title.style.fontFamily,fontWeight:i.config.xaxis.title.style.fontWeight,foreColor:i.config.xaxis.title.style.color,cssClass:"apexcharts-xaxis-title-text "+i.config.xaxis.title.style.cssClass});u.add(f),s.add(u);}if(i.config.xaxis.axisBorder.show){var x=i.globals.barPadForNumericAxis,b=a.drawLine(i.globals.padHorizontal+i.config.xaxis.axisBorder.offsetX-x,this.offY,this.xaxisBorderWidth+x,this.offY,i.config.xaxis.axisBorder.color,0,this.xaxisBorderHeight);s.add(b);}return s}},{key:"drawXaxisInversed",value:function(t){var e,i,a=this.w,s=new p(this.ctx),r=a.config.yaxis[0].opposite?a.globals.translateYAxisX[t]:0,n=s.group({class:"apexcharts-yaxis apexcharts-xaxis-inversed",rel:t}),o=s.group({class:"apexcharts-yaxis-texts-g apexcharts-xaxis-inversed-texts-g",transform:"translate("+r+", 0)"});n.add(o);var l=[];if(a.config.yaxis[t].show)for(var h=0;h<this.xaxisLabels.length;h++)l.push(this.xaxisLabels[h]);i=-(e=a.globals.gridHeight/l.length)/2.2;var c=a.globals.yLabelFormatters[0],d=a.config.yaxis[0].labels;if(d.show)for(var g=0;g<=l.length-1;g++){var u=void 0===l[g]?"":l[g];u=c(u,{seriesIndex:t,dataPointIndex:g,w:a});var f=0;Array.isArray(u)&&(f=u.length/2*parseInt(d.style.fontSize,10));var x=s.drawText({x:d.offsetX-15,y:i+e+d.offsetY-f,text:u,textAnchor:this.yaxis.opposite?"start":"end",foreColor:Array.isArray(d.style.colors)?d.style.colors[g]:d.style.colors,fontSize:d.style.fontSize,fontFamily:d.style.fontFamily,fontWeight:d.style.fontWeight,isPlainText:!1,cssClass:"apexcharts-yaxis-label "+d.style.cssClass});o.add(x);var b=document.createElementNS(a.globals.SVGNS,"title");if(b.textContent=u.text,x.node.appendChild(b),0!==a.config.yaxis[t].labels.rotate){var m=s.rotateAroundCenter(x.node);x.node.setAttribute("transform","rotate(".concat(a.config.yaxis[t].labels.rotate," 0 ").concat(m.y,")"));}i+=e;}if(void 0!==a.config.yaxis[0].title.text){var v=s.group({class:"apexcharts-yaxis-title apexcharts-xaxis-title-inversed",transform:"translate("+r+", 0)"}),y=s.drawText({x:0,y:a.globals.gridHeight/2,text:a.config.yaxis[0].title.text,textAnchor:"middle",foreColor:a.config.yaxis[0].title.style.color,fontSize:a.config.yaxis[0].title.style.fontSize,fontWeight:a.config.yaxis[0].title.style.fontWeight,fontFamily:a.config.yaxis[0].title.style.fontFamily,cssClass:"apexcharts-yaxis-title-text "+a.config.yaxis[0].title.style.cssClass});v.add(y),n.add(v);}var w=0;this.isCategoryBarHorizontal&&a.config.yaxis[0].opposite&&(w=a.globals.gridWidth);var k=a.config.xaxis.axisBorder;if(k.show){var A=s.drawLine(a.globals.padHorizontal+k.offsetX+w,1+k.offsetY,a.globals.padHorizontal+k.offsetX+w,a.globals.gridHeight+k.offsetY,k.color,0);n.add(A);}return a.config.yaxis[0].axisTicks.show&&this.axesUtils.drawYAxisTicks(w,l.length,a.config.yaxis[0].axisBorder,a.config.yaxis[0].axisTicks,0,e,n),n}},{key:"drawXaxisTicks",value:function(t,e){var i=this.w,a=t;if(!(t<0||t-2>i.globals.gridWidth)){var s=this.offY+i.config.xaxis.axisTicks.offsetY,r=s+i.config.xaxis.axisTicks.height;if("top"===i.config.xaxis.position&&(r=s-i.config.xaxis.axisTicks.height),i.config.xaxis.axisTicks.show){var n=new p(this.ctx).drawLine(t+i.config.xaxis.axisTicks.offsetX,s+i.config.xaxis.offsetY,a+i.config.xaxis.axisTicks.offsetX,r+i.config.xaxis.offsetY,i.config.xaxis.axisTicks.color);e.add(n),n.node.classList.add("apexcharts-xaxis-tick");}}}},{key:"getXAxisTicksPositions",value:function(){var t=this.w,e=[],i=this.xaxisLabels.length,a=t.globals.padHorizontal;if(t.globals.timescaleLabels.length>0)for(var s=0;s<i;s++)a=this.xaxisLabels[s].position,e.push(a);else for(var r=i,n=0;n<r;n++){var o=r;t.globals.isXNumeric&&"bar"!==t.config.chart.type&&(o-=1),a+=t.globals.gridWidth/o,e.push(a);}return e}},{key:"xAxisLabelCorrections",value:function(){var t=this.w,e=new p(this.ctx),i=t.globals.dom.baseEl.querySelector(".apexcharts-xaxis-texts-g"),a=t.globals.dom.baseEl.querySelectorAll(".apexcharts-xaxis-texts-g text"),s=t.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxis-inversed text"),r=t.globals.dom.baseEl.querySelectorAll(".apexcharts-xaxis-inversed-texts-g text tspan");if(t.globals.rotateXLabels||t.config.xaxis.labels.rotateAlways)for(var n=0;n<a.length;n++){var o=e.rotateAroundCenter(a[n]);o.y=o.y-1,o.x=o.x+1,a[n].setAttribute("transform","rotate(".concat(t.config.xaxis.labels.rotate," ").concat(o.x," ").concat(o.y,")")),a[n].setAttribute("text-anchor","end");i.setAttribute("transform","translate(0, ".concat(-10,")"));var l=a[n].childNodes;t.config.xaxis.labels.trim&&Array.prototype.forEach.call(l,(function(i){e.placeTextWithEllipsis(i,i.textContent,t.config.xaxis.labels.maxHeight-("bottom"===t.config.legend.position?20:10));}));}else !function(){for(var i=t.globals.gridWidth/(t.globals.labels.length+1),s=0;s<a.length;s++){var r=a[s].childNodes;t.config.xaxis.labels.trim&&"datetime"!==t.config.xaxis.type&&Array.prototype.forEach.call(r,(function(t){e.placeTextWithEllipsis(t,t.textContent,i);}));}}();if(s.length>0){var h=s[s.length-1].getBBox(),c=s[0].getBBox();h.x<-20&&s[s.length-1].parentNode.removeChild(s[s.length-1]),c.x+c.width>t.globals.gridWidth&&!t.globals.isBarHorizontal&&s[0].parentNode.removeChild(s[0]);for(var d=0;d<r.length;d++)e.placeTextWithEllipsis(r[d],r[d].textContent,t.config.yaxis[0].labels.maxWidth-2*parseFloat(t.config.yaxis[0].title.style.fontSize)-20);}}}]),t}(),_=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;var a=this.w;this.xaxisLabels=a.globals.labels.slice(),this.axesUtils=new B(i),this.isTimelineBar="datetime"===a.config.xaxis.type&&a.globals.seriesRangeBarTimeline.length,a.globals.timescaleLabels.length>0&&(this.xaxisLabels=a.globals.timescaleLabels.slice());}return a(t,[{key:"drawGridArea",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,e=this.w,i=new p(this.ctx);null===t&&(t=i.group({class:"apexcharts-grid"}));var a=i.drawLine(e.globals.padHorizontal,1,e.globals.padHorizontal,e.globals.gridHeight,"transparent"),s=i.drawLine(e.globals.padHorizontal,e.globals.gridHeight,e.globals.gridWidth,e.globals.gridHeight,"transparent");return t.add(s),t.add(a),t}},{key:"drawGrid",value:function(){var t=null;return this.w.globals.axisCharts&&(t=this.renderGrid(),this.drawGridArea(t.el)),t}},{key:"createGridMask",value:function(){var t=this.w,e=t.globals,i=new p(this.ctx),a=Array.isArray(t.config.stroke.width)?0:t.config.stroke.width;if(Array.isArray(t.config.stroke.width)){var s=0;t.config.stroke.width.forEach((function(t){s=Math.max(s,t);})),a=s;}e.dom.elGridRectMask=document.createElementNS(e.SVGNS,"clipPath"),e.dom.elGridRectMask.setAttribute("id","gridRectMask".concat(e.cuid)),e.dom.elGridRectMarkerMask=document.createElementNS(e.SVGNS,"clipPath"),e.dom.elGridRectMarkerMask.setAttribute("id","gridRectMarkerMask".concat(e.cuid));var r=t.config.chart.type,n=0,o=0;("bar"===r||"rangeBar"===r||t.globals.comboBarCount>0)&&t.globals.isXNumeric&&!t.globals.isBarHorizontal&&(n=t.config.grid.padding.left,o=t.config.grid.padding.right,e.barPadForNumericAxis>n&&(n=e.barPadForNumericAxis,o=e.barPadForNumericAxis)),e.dom.elGridRect=i.drawRect(-a/2-n-2,-a/2,e.gridWidth+a+o+n+4,e.gridHeight+a,0,"#fff"),new m(this).getLargestMarkerSize();var l=t.globals.markers.largestSize+1;e.dom.elGridRectMarker=i.drawRect(2*-l,2*-l,e.gridWidth+4*l,e.gridHeight+4*l,0,"#fff"),e.dom.elGridRectMask.appendChild(e.dom.elGridRect.node),e.dom.elGridRectMarkerMask.appendChild(e.dom.elGridRectMarker.node);var h=e.dom.baseEl.querySelector("defs");h.appendChild(e.dom.elGridRectMask),h.appendChild(e.dom.elGridRectMarkerMask);}},{key:"_drawGridLines",value:function(t){var e=t.i,i=t.x1,a=t.y1,s=t.x2,r=t.y2,n=t.xCount,o=t.parent,l=this.w;0===e&&l.globals.skipFirstTimelinelabel||e===n-1&&l.globals.skipLastTimelinelabel||"radar"===l.config.chart.type||(l.config.grid.xaxis.lines.show&&this._drawGridLine({x1:i,y1:a,x2:s,y2:r,parent:o}),new G(this.ctx).drawXaxisTicks(i,this.elg));}},{key:"_drawGridLine",value:function(t){var e=t.x1,i=t.y1,a=t.x2,s=t.y2,r=t.parent,n=this.w,o=r.node.classList.contains("apexcharts-gridlines-horizontal"),l=n.config.grid.strokeDashArray,h=n.globals.barPadForNumericAxis,c=new p(this).drawLine(e-(o?h:0),i,a+(o?h:0),s,n.config.grid.borderColor,l);c.node.classList.add("apexcharts-gridline"),r.add(c);}},{key:"_drawGridBandRect",value:function(t){var e=t.c,i=t.x1,a=t.y1,s=t.x2,r=t.y2,n=t.type,o=this.w,l=new p(this.ctx),h=o.globals.barPadForNumericAxis;if("column"!==n||"datetime"!==o.config.xaxis.type){var c=o.config.grid[n].colors[e],d=l.drawRect(i-("row"===n?h:0),a,s+("row"===n?2*h:0),r,0,c,o.config.grid[n].opacity);this.elg.add(d),d.attr("clip-path","url(#gridRectMask".concat(o.globals.cuid,")")),d.node.classList.add("apexcharts-grid-".concat(n));}}},{key:"_drawXYLines",value:function(t){var e=this,i=t.xCount,a=t.tickAmount,s=this.w;if(s.config.grid.xaxis.lines.show||s.config.xaxis.axisTicks.show){var r=s.globals.padHorizontal,n=s.globals.gridHeight;s.globals.timescaleLabels.length?function(t){for(var a=t.xC,s=t.x1,r=t.y1,n=t.x2,o=t.y2,l=0;l<a;l++)s=e.xaxisLabels[l].position,n=e.xaxisLabels[l].position,e._drawGridLines({i:l,x1:s,y1:r,x2:n,y2:o,xCount:i,parent:e.elgridLinesV});}({xC:i,x1:r,y1:0,x2:void 0,y2:n}):(s.globals.isXNumeric&&(i=s.globals.xAxisScale.result.length),s.config.xaxis.convertedCatToNumeric&&(i=s.globals.xaxisLabelsCount),function(t){for(var a=t.xC,r=t.x1,n=t.y1,o=t.x2,l=t.y2,h=0;h<a+(s.globals.isXNumeric?0:1);h++)0===h&&1===a&&1===s.globals.dataPoints&&(o=r=s.globals.gridWidth/2),e._drawGridLines({i:h,x1:r,y1:n,x2:o,y2:l,xCount:i,parent:e.elgridLinesV}),o=r+=s.globals.gridWidth/(s.globals.isXNumeric?a-1:a);}({xC:i,x1:r,y1:0,x2:void 0,y2:n}));}if(s.config.grid.yaxis.lines.show){var o=0,l=0,h=s.globals.gridWidth,c=a+1;this.isTimelineBar&&(c=s.globals.labels.length);for(var d=0;d<c+(this.isTimelineBar?1:0);d++)this._drawGridLine({x1:0,y1:o,x2:h,y2:l,parent:this.elgridLinesH}),l=o+=s.globals.gridHeight/(this.isTimelineBar?c:a);}}},{key:"_drawInvertedXYLines",value:function(t){var e=t.xCount,i=this.w;if(i.config.grid.xaxis.lines.show||i.config.xaxis.axisTicks.show)for(var a,s=i.globals.padHorizontal,r=i.globals.gridHeight,n=0;n<e+1;n++){i.config.grid.xaxis.lines.show&&this._drawGridLine({x1:s,y1:0,x2:a,y2:r,parent:this.elgridLinesV}),new G(this.ctx).drawXaxisTicks(s,this.elg),a=s=s+i.globals.gridWidth/e+.3;}if(i.config.grid.yaxis.lines.show)for(var o=0,l=0,h=i.globals.gridWidth,c=0;c<i.globals.dataPoints+1;c++)this._drawGridLine({x1:0,y1:o,x2:h,y2:l,parent:this.elgridLinesH}),l=o+=i.globals.gridHeight/i.globals.dataPoints;}},{key:"renderGrid",value:function(){var t=this.w,e=new p(this.ctx);this.elg=e.group({class:"apexcharts-grid"}),this.elgridLinesH=e.group({class:"apexcharts-gridlines-horizontal"}),this.elgridLinesV=e.group({class:"apexcharts-gridlines-vertical"}),this.elg.add(this.elgridLinesH),this.elg.add(this.elgridLinesV),t.config.grid.show||(this.elgridLinesV.hide(),this.elgridLinesH.hide());for(var i,a=t.globals.yAxisScale.length?t.globals.yAxisScale[0].result.length-1:5,s=0;s<t.globals.series.length&&(void 0!==t.globals.yAxisScale[s]&&(a=t.globals.yAxisScale[s].result.length-1),!(a>2));s++);return !t.globals.isBarHorizontal||this.isTimelineBar?(i=this.xaxisLabels.length,this.isTimelineBar&&(a=t.globals.labels.length),this._drawXYLines({xCount:i,tickAmount:a})):(i=a,a=t.globals.xTickAmount,this._drawInvertedXYLines({xCount:i,tickAmount:a})),this.drawGridBands(i,a),{el:this.elg,xAxisTickWidth:t.globals.gridWidth/i}}},{key:"drawGridBands",value:function(t,e){var i=this.w;if(void 0!==i.config.grid.row.colors&&i.config.grid.row.colors.length>0)for(var a=0,s=i.globals.gridHeight/e,r=i.globals.gridWidth,n=0,o=0;n<e;n++,o++)o>=i.config.grid.row.colors.length&&(o=0),this._drawGridBandRect({c:o,x1:0,y1:a,x2:r,y2:s,type:"row"}),a+=i.globals.gridHeight/e;if(void 0!==i.config.grid.column.colors&&i.config.grid.column.colors.length>0)for(var l=i.globals.isBarHorizontal||"category"!==i.config.xaxis.type&&!i.config.xaxis.convertedCatToNumeric?t:t-1,h=i.globals.padHorizontal,c=i.globals.padHorizontal+i.globals.gridWidth/l,d=i.globals.gridHeight,g=0,u=0;g<t;g++,u++)u>=i.config.grid.column.colors.length&&(u=0),this._drawGridBandRect({c:u,x1:h,y1:0,x2:c,y2:d,type:"column"}),h+=i.globals.gridWidth/l;}}]),t}(),j=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"niceScale",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:10,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,s=arguments.length>4?arguments[4]:void 0,r=this.w;if("dataPoints"===i&&(i=r.globals.dataPoints-1),t===Number.MIN_VALUE&&0===e||!g.isNumber(t)&&!g.isNumber(e)||t===Number.MIN_VALUE&&e===-Number.MAX_VALUE){t=0,e=i;var n=this.linearScale(t,e,i);return n}t>e?(console.warn("axis.min cannot be greater than axis.max"),e=t+.1):t===e&&(t=0===t?0:t-.5,e=0===e?2:e+.5);var o=[],l=Math.abs(e-t);l<1&&s&&("candlestick"===r.config.chart.type||"candlestick"===r.config.series[a].type||r.globals.isRangeData)&&(e*=1.01);var h=i+1;h<2?h=2:h>2&&(h-=2);var c=l/h,d=Math.floor(g.log10(c)),u=Math.pow(10,d),f=Math.round(c/u);f<1&&(f=1);var p=f*u,x=p*Math.floor(t/p),b=p*Math.ceil(e/p),m=x;if(s&&l>2){for(;o.push(m),!((m+=p)>b););return {result:o,niceMin:o[0],niceMax:o[o.length-1]}}var v=t;(o=[]).push(v);for(var y=Math.abs(e-t)/i,w=0;w<=i;w++)v+=y,o.push(v);return o[o.length-2]>=e&&o.pop(),{result:o,niceMin:o[0],niceMax:o[o.length-1]}}},{key:"linearScale",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:10,a=Math.abs(e-t),s=a/i;i===Number.MAX_VALUE&&(i=10,s=1);for(var r=[],n=t;i>=0;)r.push(n),n+=s,i-=1;return {result:r,niceMin:r[0],niceMax:r[r.length-1]}}},{key:"logarithmicScale",value:function(t,e,i,a){(e<0||e===Number.MIN_VALUE)&&(e=.01);for(var s=Math.log(e)/Math.log(10),r=Math.log(i)/Math.log(10),n=Math.abs(i-e)/a,o=[],l=e;a>=0;)o.push(l),l+=n,a-=1;var h=o.map((function(t,a){t<=0&&(t=.01);var n=(r-s)/(i-e),o=Math.pow(10,s+n*(t-s));return Math.round(o/g.roundToBase(o,10))*g.roundToBase(o,10)}));return 0===h[0]&&(h[0]=1),{result:h,niceMin:h[0],niceMax:h[h.length-1]}}},{key:"setYScaleForIndex",value:function(t,e,i){var a=this.w.globals,s=this.w.config,r=a.isBarHorizontal?s.xaxis:s.yaxis[t];void 0===a.yAxisScale[t]&&(a.yAxisScale[t]=[]);var n=Math.abs(i-e);if(r.logarithmic&&n<=5&&(a.invalidLogScale=!0),r.logarithmic&&n>5)a.allSeriesCollapsed=!1,a.yAxisScale[t]=this.logarithmicScale(t,e,i,r.tickAmount?r.tickAmount:Math.floor(Math.log10(i)));else if(i!==-Number.MAX_VALUE&&g.isNumber(i))if(a.allSeriesCollapsed=!1,void 0===r.min&&void 0===r.max||r.forceNiceScale){var o=void 0===s.yaxis[t].max&&void 0===s.yaxis[t].min||s.yaxis[t].forceNiceScale;a.yAxisScale[t]=this.niceScale(e,i,r.tickAmount?r.tickAmount:n<5&&n>1?n+1:5,t,o);}else a.yAxisScale[t]=this.linearScale(e,i,r.tickAmount);else a.yAxisScale[t]=this.linearScale(0,5,5);}},{key:"setXScale",value:function(t,e){var i=this.w,a=i.globals,s=i.config.xaxis,r=Math.abs(e-t);return e!==-Number.MAX_VALUE&&g.isNumber(e)?a.xAxisScale=this.niceScale(t,e,s.tickAmount?s.tickAmount:r<5&&r>1?r+1:5,0):a.xAxisScale=this.linearScale(0,5,5),a.xAxisScale}},{key:"setMultipleYScales",value:function(){var t=this,e=this.w.globals,i=this.w.config,a=e.minYArr.concat([]),s=e.maxYArr.concat([]),r=[];i.yaxis.forEach((function(e,n){var o=n;i.series.forEach((function(t,i){t.name===e.seriesName&&(o=i,n!==i?r.push({index:i,similarIndex:n,alreadyExists:!0}):r.push({index:i}));}));var l=a[o],h=s[o];t.setYScaleForIndex(n,l,h);})),this.sameScaleInMultipleAxes(a,s,r);}},{key:"sameScaleInMultipleAxes",value:function(t,e,i){var a=this,s=this.w.config,r=this.w.globals,n=[];i.forEach((function(t){t.alreadyExists&&(void 0===n[t.index]&&(n[t.index]=[]),n[t.index].push(t.index),n[t.index].push(t.similarIndex));})),r.yAxisSameScaleIndices=n,n.forEach((function(t,e){n.forEach((function(i,a){var s,r;e!==a&&(s=t,r=i,s.filter((function(t){return -1!==r.indexOf(t)}))).length>0&&(n[e]=n[e].concat(n[a]));}));}));var o=n.map((function(t){return t.filter((function(e,i){return t.indexOf(e)===i}))})).map((function(t){return t.sort()}));n=n.filter((function(t){return !!t}));var l=o.slice(),h=l.map((function(t){return JSON.stringify(t)}));l=l.filter((function(t,e){return h.indexOf(JSON.stringify(t))===e}));var c=[],d=[];t.forEach((function(t,i){l.forEach((function(a,s){a.indexOf(i)>-1&&(void 0===c[s]&&(c[s]=[],d[s]=[]),c[s].push({key:i,value:t}),d[s].push({key:i,value:e[i]}));}));}));var g=Array.apply(null,Array(l.length)).map(Number.prototype.valueOf,Number.MIN_VALUE),u=Array.apply(null,Array(l.length)).map(Number.prototype.valueOf,-Number.MAX_VALUE);c.forEach((function(t,e){t.forEach((function(t,i){g[e]=Math.min(t.value,g[e]);}));})),d.forEach((function(t,e){t.forEach((function(t,i){u[e]=Math.max(t.value,u[e]);}));})),t.forEach((function(t,e){d.forEach((function(t,i){var n=g[i],o=u[i];s.chart.stacked&&(o=0,t.forEach((function(t,e){t.value!==-Number.MAX_VALUE&&(o+=t.value),n!==Number.MIN_VALUE&&(n+=c[i][e].value);}))),t.forEach((function(i,l){t[l].key===e&&(void 0!==s.yaxis[e].min&&(n="function"==typeof s.yaxis[e].min?s.yaxis[e].min(r.minY):s.yaxis[e].min),void 0!==s.yaxis[e].max&&(o="function"==typeof s.yaxis[e].max?s.yaxis[e].max(r.maxY):s.yaxis[e].max),a.setYScaleForIndex(e,n,o));}));}));}));}},{key:"autoScaleY",value:function(t,e,i){t||(t=this);var a=t.w;if(a.globals.isMultipleYAxis||a.globals.collapsedSeries.length)return console.warn("autoScaleYaxis is not supported in a multi-yaxis chart."),e;var s=a.globals.seriesX[0],r=a.config.chart.stacked;return e.forEach((function(t,n){for(var o=0,l=0;l<s.length;l++)if(s[l]>=i.xaxis.min){o=l;break}var h,c,d=a.globals.minYArr[n],g=a.globals.maxYArr[n],u=a.globals.stackedSeriesTotals;a.globals.series.forEach((function(n,l){var f=n[o];r?(f=u[o],h=c=f,u.forEach((function(t,e){s[e]<=i.xaxis.max&&s[e]>=i.xaxis.min&&(t>c&&null!==t&&(c=t),n[e]<h&&null!==n[e]&&(h=n[e]));}))):(h=c=f,n.forEach((function(t,e){if(s[e]<=i.xaxis.max&&s[e]>=i.xaxis.min){var r=t,n=t;a.globals.series.forEach((function(i,a){null!==t&&(r=Math.min(i[e],r),n=Math.max(i[e],n));})),n>c&&null!==n&&(c=n),r<h&&null!==r&&(h=r);}}))),void 0===h&&void 0===c&&(h=d,c=g),(c*=c<0?.9:1.1)<0&&c<g&&(c=g),(h*=h<0?1.1:.9)<0&&h>d&&(h=d),e.length>1?(e[l].min=void 0===t.min?h:t.min,e[l].max=void 0===t.max?c:t.max):(e[0].min=void 0===t.min?h:t.min,e[0].max=void 0===t.max?c:t.max);}));})),e}}]),t}(),U=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.scales=new j(i);}return a(t,[{key:"init",value:function(){this.setYRange(),this.setXRange(),this.setZRange();}},{key:"getMinYMaxY",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:-Number.MAX_VALUE,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,s=this.w.config,r=this.w.globals,n=-Number.MAX_VALUE,o=Number.MIN_VALUE;null===a&&(a=t+1);var l=r.series,h=l,c=l;"candlestick"===s.chart.type?(h=r.seriesCandleL,c=r.seriesCandleH):r.isRangeData&&(h=r.seriesRangeStart,c=r.seriesRangeEnd);for(var d=t;d<a;d++){r.dataPoints=Math.max(r.dataPoints,l[d].length);for(var u=0;u<r.series[d].length;u++){var f=l[d][u];null!==f&&g.isNumber(f)?(n=Math.max(n,c[d][u]),e=Math.min(e,h[d][u]),i=Math.max(i,h[d][u]),"candlestick"===this.w.config.chart.type&&(n=Math.max(n,r.seriesCandleO[d][u]),n=Math.max(n,r.seriesCandleH[d][u]),n=Math.max(n,r.seriesCandleL[d][u]),i=n=Math.max(n,r.seriesCandleC[d][u])),g.isFloat(f)&&(f=g.noExponents(f),r.yValueDecimal=Math.max(r.yValueDecimal,f.toString().split(".")[1].length)),o>h[d][u]&&h[d][u]<0&&(o=h[d][u])):r.hasNullValues=!0;}}return "rangeBar"===s.chart.type&&r.seriesRangeStart.length&&r.isBarHorizontal&&"datetime"===s.xaxis.type&&(o=e),"bar"===s.chart.type&&(o<0&&n<0&&(n=0),o===Number.MIN_VALUE&&(o=0)),{minY:o,maxY:n,lowestY:e,highestY:i}}},{key:"setYRange",value:function(){var t=this.w.globals,e=this.w.config;t.maxY=-Number.MAX_VALUE,t.minY=Number.MIN_VALUE;var i=Number.MAX_VALUE;if(t.isMultipleYAxis)for(var a=0;a<t.series.length;a++){var s=this.getMinYMaxY(a,i,null,a+1);t.minYArr.push(s.minY),t.maxYArr.push(s.maxY),i=s.lowestY;}var r=this.getMinYMaxY(0,i,null,t.series.length);if(t.minY=r.minY,t.maxY=r.maxY,i=r.lowestY,e.chart.stacked&&this._setStackedMinMax(),("line"===e.chart.type||"area"===e.chart.type||"candlestick"===e.chart.type||"rangeBar"===e.chart.type&&!t.isBarHorizontal)&&t.minY===Number.MIN_VALUE&&i!==-Number.MAX_VALUE&&i!==t.maxY){var n=t.maxY-i;i>=0&&i<=10&&(n=0),t.minY=i-5*n/100,i>0&&t.minY<0&&(t.minY=0),t.maxY=t.maxY+5*n/100;}if(e.yaxis.forEach((function(e,i){void 0!==e.max&&("number"==typeof e.max?t.maxYArr[i]=e.max:"function"==typeof e.max&&(t.maxYArr[i]=e.max(t.maxY)),t.maxY=t.maxYArr[i]),void 0!==e.min&&("number"==typeof e.min?t.minYArr[i]=e.min:"function"==typeof e.min&&(t.minYArr[i]=e.min(t.minY)),t.minY=t.minYArr[i]);})),t.isBarHorizontal){["min","max"].forEach((function(i){void 0!==e.xaxis[i]&&"number"==typeof e.xaxis[i]&&("min"===i?t.minY=e.xaxis[i]:t.maxY=e.xaxis[i]);}));}return t.isMultipleYAxis?(this.scales.setMultipleYScales(),t.minY=i,t.yAxisScale.forEach((function(e,i){t.minYArr[i]=e.niceMin,t.maxYArr[i]=e.niceMax;}))):(this.scales.setYScaleForIndex(0,t.minY,t.maxY),t.minY=t.yAxisScale[0].niceMin,t.maxY=t.yAxisScale[0].niceMax,t.minYArr[0]=t.yAxisScale[0].niceMin,t.maxYArr[0]=t.yAxisScale[0].niceMax),{minY:t.minY,maxY:t.maxY,minYArr:t.minYArr,maxYArr:t.maxYArr}}},{key:"setXRange",value:function(){var t=this.w.globals,e=this.w.config,i="numeric"===e.xaxis.type||"datetime"===e.xaxis.type||"category"===e.xaxis.type&&!t.noLabelsProvided||t.noLabelsProvided||t.isXNumeric;if(t.isXNumeric&&function(){for(var e=0;e<t.series.length;e++)if(t.labels[e])for(var i=0;i<t.labels[e].length;i++)null!==t.labels[e][i]&&g.isNumber(t.labels[e][i])&&(t.maxX=Math.max(t.maxX,t.labels[e][i]),t.initialMaxX=Math.max(t.maxX,t.labels[e][i]),t.minX=Math.min(t.minX,t.labels[e][i]),t.initialMinX=Math.min(t.minX,t.labels[e][i]));}(),t.noLabelsProvided&&0===e.xaxis.categories.length&&(t.maxX=t.labels[t.labels.length-1],t.initialMaxX=t.labels[t.labels.length-1],t.minX=1,t.initialMinX=1),t.isXNumeric||t.noLabelsProvided||t.dataFormatXNumeric){var a;if(void 0===e.xaxis.tickAmount?(a=Math.round(t.svgWidth/150),"numeric"===e.xaxis.type&&t.dataPoints<30&&(a=t.dataPoints-1),a>t.dataPoints&&0!==t.dataPoints&&(a=t.dataPoints-1)):"dataPoints"===e.xaxis.tickAmount?(t.series.length>1&&(a=t.series[t.maxValsInArrayIndex].length-1),t.isXNumeric&&(a=t.maxX-t.minX-1)):a=e.xaxis.tickAmount,t.xTickAmount=a,void 0!==e.xaxis.max&&"number"==typeof e.xaxis.max&&(t.maxX=e.xaxis.max),void 0!==e.xaxis.min&&"number"==typeof e.xaxis.min&&(t.minX=e.xaxis.min),void 0!==e.xaxis.range&&(t.minX=t.maxX-e.xaxis.range),t.minX!==Number.MAX_VALUE&&t.maxX!==-Number.MAX_VALUE)if(e.xaxis.convertedCatToNumeric&&!t.dataFormatXNumeric){for(var s=[],r=t.minX-1;r<t.maxX;r++)s.push(r+1);t.xAxisScale={result:s,niceMin:s[0],niceMax:s[s.length-1]};}else t.xAxisScale=this.scales.setXScale(t.minX,t.maxX);else t.xAxisScale=this.scales.linearScale(1,a,a),t.noLabelsProvided&&t.labels.length>0&&(t.xAxisScale=this.scales.linearScale(1,t.labels.length,a-1),t.seriesX=t.labels.slice());i&&(t.labels=t.xAxisScale.result.slice());}return t.isBarHorizontal&&t.labels.length&&(t.xTickAmount=t.labels.length),this._handleSingleDataPoint(),this._getMinXDiff(),{minX:t.minX,maxX:t.maxX}}},{key:"setZRange",value:function(){var t=this.w.globals;if(t.isDataXYZ)for(var e=0;e<t.series.length;e++)if(void 0!==t.seriesZ[e])for(var i=0;i<t.seriesZ[e].length;i++)null!==t.seriesZ[e][i]&&g.isNumber(t.seriesZ[e][i])&&(t.maxZ=Math.max(t.maxZ,t.seriesZ[e][i]),t.minZ=Math.min(t.minZ,t.seriesZ[e][i]));}},{key:"_handleSingleDataPoint",value:function(){var t=this.w.globals,e=this.w.config;if(t.minX===t.maxX){var i=new Y(this.ctx);if("datetime"===e.xaxis.type){var a=i.getDate(t.minX);a.setUTCDate(a.getDate()-2),t.minX=new Date(a).getTime();var s=i.getDate(t.maxX);s.setUTCDate(s.getDate()+2),t.maxX=new Date(s).getTime();}else ("numeric"===e.xaxis.type||"category"===e.xaxis.type&&!t.noLabelsProvided)&&(t.minX=t.minX-2,t.initialMinX=t.minX,t.maxX=t.maxX+2,t.initialMaxX=t.maxX);}}},{key:"_getMinXDiff",value:function(){var t=this.w.globals;t.isXNumeric&&t.seriesX.forEach((function(e,i){1===e.length&&e.push(t.seriesX[t.maxValsInArrayIndex][t.seriesX[t.maxValsInArrayIndex].length-1]);var a=e.slice();a.sort((function(t,e){return t-e})),a.forEach((function(e,a){if(a>0){var s=e-t.seriesX[i][a-1];s>0&&(t.minXDiff=Math.min(s,t.minXDiff));}})),1===t.dataPoints&&t.minXDiff===Number.MAX_VALUE&&(t.minXDiff=.5);}));}},{key:"_setStackedMinMax",value:function(){var t=this.w.globals,e=[],i=[];if(t.series.length)for(var a=0;a<t.series[t.maxValsInArrayIndex].length;a++)for(var s=0,r=0,n=0;n<t.series.length;n++)null!==t.series[n][a]&&g.isNumber(t.series[n][a])&&(t.series[n][a]>0?s=s+parseFloat(t.series[n][a])+1e-4:r+=parseFloat(t.series[n][a])),n===t.series.length-1&&(e.push(s),i.push(r));for(var o=0;o<e.length;o++)t.maxY=Math.max(t.maxY,e[o]),t.minY=Math.min(t.minY,i[o]);}}]),t}(),q=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;var a=this.w;this.xaxisFontSize=a.config.xaxis.labels.style.fontSize,this.axisFontFamily=a.config.xaxis.labels.style.fontFamily,this.xaxisForeColors=a.config.xaxis.labels.style.colors,this.isCategoryBarHorizontal="bar"===a.config.chart.type&&a.config.plotOptions.bar.horizontal,this.xAxisoffX=0,"bottom"===a.config.xaxis.position&&(this.xAxisoffX=a.globals.gridHeight),this.drawnLabels=[],this.axesUtils=new B(i);}return a(t,[{key:"drawYaxis",value:function(t){var e=this.w,i=new p(this.ctx),a=e.config.yaxis[t].labels.style,s=a.fontSize,r=a.fontFamily,n=a.fontWeight,o=i.group({class:"apexcharts-yaxis",rel:t,transform:"translate("+e.globals.translateYAxisX[t]+", 0)"});if(this.axesUtils.isYAxisHidden(t))return o;var l=i.group({class:"apexcharts-yaxis-texts-g"});o.add(l);var h=e.globals.yAxisScale[t].result.length-1,c=e.globals.gridHeight/h,d=e.globals.translateY,g=e.globals.yLabelFormatters[t],u=e.globals.yAxisScale[t].result.slice();u=this.axesUtils.checkForReversedLabels(t,u);var f="";if(e.config.yaxis[t].labels.show)for(var x=function(o){var p=u[o];p=g(p,o);var x=e.config.yaxis[t].labels.padding;e.config.yaxis[t].opposite&&0!==e.config.yaxis.length&&(x*=-1);var b=i.drawText({x:x,y:d+h/10+e.config.yaxis[t].labels.offsetY+1,text:p,textAnchor:e.config.yaxis[t].opposite?"start":"end",fontSize:s,fontFamily:r,fontWeight:n,foreColor:Array.isArray(a.colors)?a.colors[o]:a.colors,isPlainText:!1,cssClass:"apexcharts-yaxis-label "+a.cssClass});if(o===h&&(f=b),l.add(b),0!==e.config.yaxis[t].labels.rotate){var m=i.rotateAroundCenter(f.node),v=i.rotateAroundCenter(b.node);b.node.setAttribute("transform","rotate(".concat(e.config.yaxis[t].labels.rotate," ").concat(m.x," ").concat(v.y,")"));}d+=c;},b=h;b>=0;b--)x(b);if(void 0!==e.config.yaxis[t].title.text){var m=i.group({class:"apexcharts-yaxis-title"}),v=0;e.config.yaxis[t].opposite&&(v=e.globals.translateYAxisX[t]);var y=i.drawText({x:v,y:e.globals.gridHeight/2+e.globals.translateY+e.config.yaxis[t].title.offsetY,text:e.config.yaxis[t].title.text,textAnchor:"end",foreColor:e.config.yaxis[t].title.style.color,fontSize:e.config.yaxis[t].title.style.fontSize,fontWeight:e.config.yaxis[t].title.style.fontWeight,fontFamily:e.config.yaxis[t].title.style.fontFamily,cssClass:"apexcharts-yaxis-title-text "+e.config.yaxis[t].title.style.cssClass});m.add(y),o.add(m);}var w=e.config.yaxis[t].axisBorder,k=31+w.offsetX;if(e.config.yaxis[t].opposite&&(k=-31-w.offsetX),w.show){var A=i.drawLine(k,e.globals.translateY+w.offsetY-2,k,e.globals.gridHeight+e.globals.translateY+w.offsetY+2,w.color,0,w.width);o.add(A);}return e.config.yaxis[t].axisTicks.show&&this.axesUtils.drawYAxisTicks(k,h,w,e.config.yaxis[t].axisTicks,t,c,o),o}},{key:"drawYaxisInversed",value:function(t){var e=this.w,i=new p(this.ctx),a=i.group({class:"apexcharts-xaxis apexcharts-yaxis-inversed"}),s=i.group({class:"apexcharts-xaxis-texts-g",transform:"translate(".concat(e.globals.translateXAxisX,", ").concat(e.globals.translateXAxisY,")")});a.add(s);var r=e.globals.yAxisScale[t].result.length-1,n=e.globals.gridWidth/r+.1,o=n+e.config.xaxis.labels.offsetX,l=e.globals.xLabelFormatter,h=e.globals.yAxisScale[t].result.slice(),c=e.globals.timescaleLabels;c.length>0&&(this.xaxisLabels=c.slice(),r=(h=c.slice()).length),h=this.axesUtils.checkForReversedLabels(t,h);var d=c.length;if(e.config.xaxis.labels.show)for(var g=d?0:r;d?g<d:g>=0;d?g++:g--){var u=h[g];u=l(u,g);var f=e.globals.gridWidth+e.globals.padHorizontal-(o-n+e.config.xaxis.labels.offsetX);if(c.length){var x=this.axesUtils.getLabel(h,c,f,g,this.drawnLabels,this.xaxisFontSize);f=x.x,u=x.text,this.drawnLabels.push(x.text),0===g&&e.globals.skipFirstTimelinelabel&&(u=""),g===h.length-1&&e.globals.skipLastTimelinelabel&&(u="");}var b=i.drawText({x:f,y:this.xAxisoffX+e.config.xaxis.labels.offsetY+30-("top"===e.config.xaxis.position?e.globals.xAxisHeight+e.config.xaxis.axisTicks.height-2:0),text:u,textAnchor:"middle",foreColor:Array.isArray(this.xaxisForeColors)?this.xaxisForeColors[t]:this.xaxisForeColors,fontSize:this.xaxisFontSize,fontFamily:this.xaxisFontFamily,fontWeight:e.config.xaxis.labels.style.fontWeight,isPlainText:!1,cssClass:"apexcharts-xaxis-label "+e.config.xaxis.labels.style.cssClass});s.add(b),b.tspan(u);var m=document.createElementNS(e.globals.SVGNS,"title");m.textContent=u,b.node.appendChild(m),o+=n;}return this.inversedYAxisTitleText(a),this.inversedYAxisBorder(a),a}},{key:"inversedYAxisBorder",value:function(t){var e=this.w,i=new p(this.ctx),a=e.config.xaxis.axisBorder;if(a.show){var s=0;"bar"===e.config.chart.type&&e.globals.isXNumeric&&(s-=15);var r=i.drawLine(e.globals.padHorizontal+s+a.offsetX,this.xAxisoffX,e.globals.gridWidth,this.xAxisoffX,a.color,0,a.height);t.add(r);}}},{key:"inversedYAxisTitleText",value:function(t){var e=this.w,i=new p(this.ctx);if(void 0!==e.config.xaxis.title.text){var a=i.group({class:"apexcharts-xaxis-title apexcharts-yaxis-title-inversed"}),s=i.drawText({x:e.globals.gridWidth/2+e.config.xaxis.title.offsetX,y:this.xAxisoffX+parseFloat(this.xaxisFontSize)+parseFloat(e.config.xaxis.title.style.fontSize)+e.config.xaxis.title.offsetY+20,text:e.config.xaxis.title.text,textAnchor:"middle",fontSize:e.config.xaxis.title.style.fontSize,fontFamily:e.config.xaxis.title.style.fontFamily,fontWeight:e.config.xaxis.title.style.fontWeight,cssClass:"apexcharts-xaxis-title-text "+e.config.xaxis.title.style.cssClass});a.add(s),t.add(a);}}},{key:"yAxisTitleRotate",value:function(t,e){var i=this.w,a=new p(this.ctx),s={width:0,height:0},r={width:0,height:0},n=i.globals.dom.baseEl.querySelector(" .apexcharts-yaxis[rel='".concat(t,"'] .apexcharts-yaxis-texts-g"));null!==n&&(s=n.getBoundingClientRect());var o=i.globals.dom.baseEl.querySelector(".apexcharts-yaxis[rel='".concat(t,"'] .apexcharts-yaxis-title text"));if(null!==o&&(r=o.getBoundingClientRect()),null!==o){var l=this.xPaddingForYAxisTitle(t,s,r,e);o.setAttribute("x",l.xPos-(e?10:0));}if(null!==o){var h=a.rotateAroundCenter(o);o.setAttribute("transform","rotate(".concat(e?"":"-").concat(i.config.yaxis[t].title.rotate," ").concat(h.x," ").concat(h.y,")"));}}},{key:"xPaddingForYAxisTitle",value:function(t,e,i,a){var s=this.w,r=0,n=0,o=10;return void 0===s.config.yaxis[t].title.text||t<0?{xPos:n,padd:0}:(a?(n=e.width+s.config.yaxis[t].title.offsetX+i.width/2+o/2,0===(r+=1)&&(n-=o/2)):(n=-1*e.width+s.config.yaxis[t].title.offsetX+o/2+i.width/2,s.globals.isBarHorizontal&&(o=25,n=-1*e.width-s.config.yaxis[t].title.offsetX-o)),{xPos:n,padd:o})}},{key:"setYAxisXPosition",value:function(t,e){var i=this.w,a=0,s=0,r=18,n=1;i.config.yaxis.length>1&&(this.multipleYs=!0),i.config.yaxis.map((function(o,l){var h=i.globals.ignoreYAxisIndexes.indexOf(l)>-1||!o.show||o.floating||0===t[l].width,c=t[l].width+e[l].width;o.opposite?i.globals.isBarHorizontal?(s=i.globals.gridWidth+i.globals.translateX-1,i.globals.translateYAxisX[l]=s-o.labels.offsetX):(s=i.globals.gridWidth+i.globals.translateX+n,h||(n=n+c+20),i.globals.translateYAxisX[l]=s-o.labels.offsetX+20):(a=i.globals.translateX-r,h||(r=r+c+20),i.globals.translateYAxisX[l]=a+o.labels.offsetX);}));}},{key:"setYAxisTextAlignments",value:function(){var t=this.w,e=t.globals.dom.baseEl.getElementsByClassName("apexcharts-yaxis");(e=g.listToArray(e)).forEach((function(e,i){var a=t.config.yaxis[i];if(void 0!==a.labels.align){var s=t.globals.dom.baseEl.querySelector(".apexcharts-yaxis[rel='".concat(i,"'] .apexcharts-yaxis-texts-g")),r=t.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxis[rel='".concat(i,"'] .apexcharts-yaxis-label"));r=g.listToArray(r);var n=s.getBoundingClientRect();"left"===a.labels.align?(r.forEach((function(t,e){t.setAttribute("text-anchor","start");})),a.opposite||s.setAttribute("transform","translate(-".concat(n.width,", 0)"))):"center"===a.labels.align?(r.forEach((function(t,e){t.setAttribute("text-anchor","middle");})),s.setAttribute("transform","translate(".concat(n.width/2*(a.opposite?1:-1),", 0)"))):"right"===a.labels.align&&(r.forEach((function(t,e){t.setAttribute("text-anchor","end");})),a.opposite&&s.setAttribute("transform","translate(".concat(n.width,", 0)")));}}));}}]),t}(),Z=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.documentEvent=g.bind(this.documentEvent,this);}return a(t,[{key:"addEventListener",value:function(t,e){var i=this.w;i.globals.events.hasOwnProperty(t)?i.globals.events[t].push(e):i.globals.events[t]=[e];}},{key:"removeEventListener",value:function(t,e){var i=this.w;if(i.globals.events.hasOwnProperty(t)){var a=i.globals.events[t].indexOf(e);-1!==a&&i.globals.events[t].splice(a,1);}}},{key:"fireEvent",value:function(t,e){var i=this.w;if(i.globals.events.hasOwnProperty(t)){e&&e.length||(e=[]);for(var a=i.globals.events[t],s=a.length,r=0;r<s;r++)a[r].apply(null,e);}}},{key:"setupEventHandlers",value:function(){var t=this,e=this.w,i=this.ctx,a=e.globals.dom.baseEl.querySelector(e.globals.chartClass);this.ctx.eventList.forEach((function(t){a.addEventListener(t,(function(t){var a=Object.assign({},e,{seriesIndex:e.globals.capturedSeriesIndex,dataPointIndex:e.globals.capturedDataPointIndex});"mousemove"===t.type||"touchmove"===t.type?"function"==typeof e.config.chart.events.mouseMove&&e.config.chart.events.mouseMove(t,i,a):("mouseup"===t.type&&1===t.which||"touchend"===t.type)&&("function"==typeof e.config.chart.events.click&&e.config.chart.events.click(t,i,a),i.ctx.events.fireEvent("click",[t,i,a]));}),{capture:!1,passive:!0});})),this.ctx.eventList.forEach((function(e){document.addEventListener(e,t.documentEvent);})),this.ctx.core.setupBrushHandler();}},{key:"documentEvent",value:function(t){var e=this.w,i=t.target.className;if("click"===t.type){var a=e.globals.dom.baseEl.querySelector(".apexcharts-menu");a&&a.classList.contains("apexcharts-menu-open")&&"apexcharts-menu-icon"!==i&&a.classList.remove("apexcharts-menu-open");}if("mousedown"===t.type){var s=e.globals.dom.Paper.select(".apexcharts-resizable-element").members;Array.prototype.forEach.call(s,(function(e){t.target.classList.contains("apexcharts-resizable-element")||t.target.classList.contains("svg_select_points")||e.selectize(!1);}));}e.globals.clientX="touchmove"===t.type?t.touches[0].clientX:t.clientX,e.globals.clientY="touchmove"===t.type?t.touches[0].clientY:t.clientY;}}]),t}(),$=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"setCurrentLocaleValues",value:function(t){var e=this.w.config.chart.locales;window.Apex.chart&&window.Apex.chart.locales&&window.Apex.chart.locales.length>0&&(e=this.w.config.chart.locales.concat(window.Apex.chart.locales));var i=e.filter((function(e){return e.name===t}))[0];if(!i)throw new Error("Wrong locale name provided. Please make sure you set the correct locale name in options");var a=g.extend(A,i);this.w.globals.locale=a.options;}}]),t}(),J=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"drawAxis",value:function(t,e){var i,a,s=this.w.globals,r=this.w.config,n=new G(this.ctx),o=new q(this.ctx);s.axisCharts&&"radar"!==t&&(s.isBarHorizontal?(a=o.drawYaxisInversed(0),i=n.drawXaxisInversed(0),s.dom.elGraphical.add(i),s.dom.elGraphical.add(a)):(i=n.drawXaxis(),s.dom.elGraphical.add(i),r.yaxis.map((function(t,e){-1===s.ignoreYAxisIndexes.indexOf(e)&&(a=o.drawYaxis(e),s.dom.Paper.add(a));}))));r.yaxis.map((function(t,e){-1===s.ignoreYAxisIndexes.indexOf(e)&&o.yAxisTitleRotate(e,t.opposite);}));}}]),t}(),Q=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"drawXCrosshairs",value:function(){var t=this.w,e=new p(this.ctx),i=new u(this.ctx),a=t.config.xaxis.crosshairs.fill.gradient,s=t.config.xaxis.crosshairs.dropShadow,r=t.config.xaxis.crosshairs.fill.type,n=a.colorFrom,o=a.colorTo,l=a.opacityFrom,h=a.opacityTo,c=a.stops,d=s.enabled,f=s.left,x=s.top,b=s.blur,m=s.color,v=s.opacity,y=t.config.xaxis.crosshairs.fill.color;if(t.config.xaxis.crosshairs.show){"gradient"===r&&(y=e.drawGradient("vertical",n,o,l,h,null,c,null));var w=e.drawRect();1===t.config.xaxis.crosshairs.width&&(w=e.drawLine()),w.attr({class:"apexcharts-xcrosshairs",x:0,y:0,y2:t.globals.gridHeight,width:g.isNumber(t.config.xaxis.crosshairs.width)?t.config.xaxis.crosshairs.width:0,height:t.globals.gridHeight,fill:y,filter:"none","fill-opacity":t.config.xaxis.crosshairs.opacity,stroke:t.config.xaxis.crosshairs.stroke.color,"stroke-width":t.config.xaxis.crosshairs.stroke.width,"stroke-dasharray":t.config.xaxis.crosshairs.stroke.dashArray}),d&&(w=i.dropShadow(w,{left:f,top:x,blur:b,color:m,opacity:v})),t.globals.dom.elGraphical.add(w);}}},{key:"drawYCrosshairs",value:function(){var t=this.w,e=new p(this.ctx),i=t.config.yaxis[0].crosshairs,a=t.globals.barPadForNumericAxis;if(t.config.yaxis[0].crosshairs.show){var s=e.drawLine(-a,0,t.globals.gridWidth+a,0,i.stroke.color,i.stroke.dashArray,i.stroke.width);s.attr({class:"apexcharts-ycrosshairs"}),t.globals.dom.elGraphical.add(s);}var r=e.drawLine(-a,0,t.globals.gridWidth+a,0,i.stroke.color,0,0);r.attr({class:"apexcharts-ycrosshairs-hidden"}),t.globals.dom.elGraphical.add(r);}}]),t}(),K=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"checkResponsiveConfig",value:function(t){var e=this,i=this.w,a=i.config;if(0!==a.responsive.length){var s=a.responsive.slice();s.sort((function(t,e){return t.breakpoint>e.breakpoint?1:e.breakpoint>t.breakpoint?-1:0})).reverse();var r=new D({}),n=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},a=s[0].breakpoint,n=window.innerWidth>0?window.innerWidth:screen.width;if(n>a){var o=m.extendArrayProps(r,i.globals.initialConfig,i);t=g.extend(o,t),t=g.extend(i.config,t),e.overrideResponsiveOptions(t);}else for(var l=0;l<s.length;l++)n<s[l].breakpoint&&(t=m.extendArrayProps(r,s[l].options,i),t=g.extend(i.config,t),e.overrideResponsiveOptions(t));};if(t){var o=m.extendArrayProps(r,t,i);o=g.extend(i.config,o),n(o=g.extend(o,t));}else n({});}}},{key:"overrideResponsiveOptions",value:function(t){var e=new D(t).init({responsiveOverride:!0});this.w.config=e;}}]),t}(),tt=function(){function t(i){e(this,t),this.ctx=i,this.colors=[],this.w=i.w;var a=this.w;this.isColorFn=!1,this.isBarDistributed=a.config.plotOptions.bar.distributed&&("bar"===a.config.chart.type||"rangeBar"===a.config.chart.type);}return a(t,[{key:"init",value:function(){this.setDefaultColors();}},{key:"setDefaultColors",value:function(){var t=this,e=this.w,i=new g;if(e.globals.dom.elWrap.classList.add("apexcharts-theme-".concat(e.config.theme.mode)),void 0===e.config.colors?e.globals.colors=this.predefined():(e.globals.colors=e.config.colors,Array.isArray(e.config.colors)&&e.config.colors.length>0&&"function"==typeof e.config.colors[0]&&(e.globals.colors=e.config.series.map((function(i,a){var s=e.config.colors[a];return s||(s=e.config.colors[0]),"function"==typeof s?(t.isColorFn=!0,s({value:e.globals.axisCharts?e.globals.series[a][0]?e.globals.series[a][0]:0:e.globals.series[a],seriesIndex:a,dataPointIndex:a,w:e})):s})))),e.config.theme.monochrome.enabled){var a=[],s=e.globals.series.length;this.isBarDistributed&&(s=e.globals.series[0].length*e.globals.series.length);for(var r=e.config.theme.monochrome.color,n=1/(s/e.config.theme.monochrome.shadeIntensity),o=e.config.theme.monochrome.shadeTo,l=0,h=0;h<s;h++){var c=void 0;"dark"===o?(c=i.shadeColor(-1*l,r),l+=n):(c=i.shadeColor(l,r),l+=n),a.push(c);}e.globals.colors=a.slice();}var d=e.globals.colors.slice();this.pushExtraColors(e.globals.colors);["fill","stroke"].forEach((function(i){void 0===e.config[i].colors?e.globals[i].colors=t.isColorFn?e.config.colors:d:e.globals[i].colors=e.config[i].colors.slice(),t.pushExtraColors(e.globals[i].colors);})),void 0===e.config.dataLabels.style.colors?e.globals.dataLabels.style.colors=d:e.globals.dataLabels.style.colors=e.config.dataLabels.style.colors.slice(),this.pushExtraColors(e.globals.dataLabels.style.colors,50),void 0===e.config.plotOptions.radar.polygons.fill.colors?e.globals.radarPolygons.fill.colors=["dark"===e.config.theme.mode?"#424242":"#fff"]:e.globals.radarPolygons.fill.colors=e.config.plotOptions.radar.polygons.fill.colors.slice(),this.pushExtraColors(e.globals.radarPolygons.fill.colors,20),void 0===e.config.markers.colors?e.globals.markers.colors=d:e.globals.markers.colors=e.config.markers.colors.slice(),this.pushExtraColors(e.globals.markers.colors);}},{key:"pushExtraColors",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=this.w,s=e||a.globals.series.length;if(null===i&&(i=this.isBarDistributed||"heatmap"===a.config.chart.type&&a.config.plotOptions.heatmap.colorScale.inverse),i&&(s=a.globals.series[0].length*a.globals.series.length),t.length<s)for(var r=s-t.length,n=0;n<r;n++)t.push(t[n]);}},{key:"updateThemeOptions",value:function(t){t.chart=t.chart||{},t.tooltip=t.tooltip||{};var e=t.theme.mode||"light",i=t.theme.palette?t.theme.palette:"dark"===e?"palette4":"palette1",a=t.chart.foreColor?t.chart.foreColor:"dark"===e?"#f6f7f8":"#373d3f";return t.tooltip.theme=e,t.chart.foreColor=a,t.theme.palette=i,t}},{key:"predefined",value:function(){switch(this.w.config.theme.palette){case"palette1":this.colors=["#008FFB","#00E396","#FEB019","#FF4560","#775DD0"];break;case"palette2":this.colors=["#3f51b5","#03a9f4","#4caf50","#f9ce1d","#FF9800"];break;case"palette3":this.colors=["#33b2df","#546E7A","#d4526e","#13d8aa","#A5978B"];break;case"palette4":this.colors=["#4ecdc4","#c7f464","#81D4FA","#fd6a6a","#546E7A"];break;case"palette5":this.colors=["#2b908f","#f9a3a4","#90ee7e","#fa4443","#69d2e7"];break;case"palette6":this.colors=["#449DD1","#F86624","#EA3546","#662E9B","#C5D86D"];break;case"palette7":this.colors=["#D7263D","#1B998B","#2E294E","#F46036","#E2C044"];break;case"palette8":this.colors=["#662E9B","#F86624","#F9C80E","#EA3546","#43BCCD"];break;case"palette9":this.colors=["#5C4742","#A5978B","#8D5B4C","#5A2A27","#C4BBAF"];break;case"palette10":this.colors=["#A300D6","#7D02EB","#5653FE","#2983FF","#00B1F2"];break;default:this.colors=["#008FFB","#00E396","#FEB019","#FF4560","#775DD0"];}return this.colors}}]),t}(),et=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"draw",value:function(){this.drawTitleSubtitle("title"),this.drawTitleSubtitle("subtitle");}},{key:"drawTitleSubtitle",value:function(t){var e=this.w,i="title"===t?e.config.title:e.config.subtitle,a=e.globals.svgWidth/2,s=i.offsetY,r="middle";if("left"===i.align?(a=10,r="start"):"right"===i.align&&(a=e.globals.svgWidth-10,r="end"),a+=i.offsetX,s=s+parseInt(i.style.fontSize,10)+i.margin/2,void 0!==i.text){var n=new p(this.ctx).drawText({x:a,y:s,text:i.text,textAnchor:r,fontSize:i.style.fontSize,fontFamily:i.style.fontFamily,fontWeight:i.style.fontWeight,foreColor:i.style.color,opacity:1});n.node.setAttribute("class","apexcharts-".concat(t,"-text")),e.globals.dom.Paper.add(n);}}}]),t}(),it=function(){function t(i){e(this,t),this.w=i.w,this.dCtx=i;}return a(t,[{key:"getTitleSubtitleCoords",value:function(t){var e=this.w,i=0,a=0,s="title"===t?e.config.title.floating:e.config.subtitle.floating,r=e.globals.dom.baseEl.querySelector(".apexcharts-".concat(t,"-text"));if(null!==r&&!s){var n=r.getBoundingClientRect();i=n.width,a=e.globals.axisCharts?n.height+5:n.height;}return {width:i,height:a}}},{key:"getLegendsRect",value:function(){var t=this.w,e=t.globals.dom.baseEl.querySelector(".apexcharts-legend"),i=Object.assign({},g.getBoundingClientRect(e));return null!==e&&!t.config.legend.floating&&t.config.legend.show?this.dCtx.lgRect={x:i.x,y:i.y,height:i.height,width:0===i.height?0:i.width}:this.dCtx.lgRect={x:0,y:0,height:0,width:0},"left"!==t.config.legend.position&&"right"!==t.config.legend.position||1.5*this.dCtx.lgRect.width>t.globals.svgWidth&&(this.dCtx.lgRect.width=t.globals.svgWidth/1.5),this.dCtx.lgRect}},{key:"getLargestStringFromMultiArr",value:function(t,e){var i=t;if(this.w.globals.isMultiLineX){var a=e.map((function(t,e){return Array.isArray(t)?t.length:1})),s=Math.max.apply(Math,d(a));i=e[a.indexOf(s)];}return i}}]),t}(),at=function(){function t(i){e(this,t),this.w=i.w,this.dCtx=i;}return a(t,[{key:"getxAxisLabelsCoords",value:function(){var t,e=this.w,i=e.globals.labels.slice();if(e.config.xaxis.convertedCatToNumeric&&0===i.length&&(i=e.globals.categoryLabels),e.globals.timescaleLabels.length>0){var a=this.getxAxisTimeScaleLabelsCoords();t={width:a.width,height:a.height},e.globals.rotateXLabels=!1;}else {this.dCtx.lgWidthForSideLegends="left"!==e.config.legend.position&&"right"!==e.config.legend.position||e.config.legend.floating?0:this.dCtx.lgRect.width;var s=e.globals.xLabelFormatter,r=g.getLargestStringFromArr(i),n=this.dCtx.dimHelpers.getLargestStringFromMultiArr(r,i);e.globals.isBarHorizontal&&(n=r=e.globals.yAxisScale[0].result.reduce((function(t,e){return t.length>e.length?t:e}),0));var o=new W(this.dCtx.ctx),l=r;r=o.xLabelFormat(s,r,l),n=o.xLabelFormat(s,n,l),(e.config.xaxis.convertedCatToNumeric&&void 0===r||""===String(r).trim())&&(n=r="1");var h=new p(this.dCtx.ctx),c=h.getTextRects(r,e.config.xaxis.labels.style.fontSize),d=c;if(r!==n&&(d=h.getTextRects(n,e.config.xaxis.labels.style.fontSize)),(t={width:c.width>=d.width?c.width:d.width,height:c.height>=d.height?c.height:d.height}).width*i.length>e.globals.svgWidth-this.dCtx.lgWidthForSideLegends-this.dCtx.yAxisWidth-this.dCtx.gridPad.left-this.dCtx.gridPad.right&&0!==e.config.xaxis.labels.rotate||e.config.xaxis.labels.rotateAlways){if(!e.globals.isBarHorizontal){e.globals.rotateXLabels=!0;var u=function(t){return h.getTextRects(t,e.config.xaxis.labels.style.fontSize,e.config.xaxis.labels.style.fontFamily,"rotate(".concat(e.config.xaxis.labels.rotate," 0 0)"),!1)};c=u(r),r!==n&&(d=u(n)),t.height=(c.height>d.height?c.height:d.height)/1.5,t.width=c.width>d.width?c.width:d.width;}}else e.globals.rotateXLabels=!1;}return e.config.xaxis.labels.show||(t={width:0,height:0}),{width:t.width,height:t.height}}},{key:"getxAxisTitleCoords",value:function(){var t=this.w,e=0,i=0;if(void 0!==t.config.xaxis.title.text){var a=new p(this.dCtx.ctx).getTextRects(t.config.xaxis.title.text,t.config.xaxis.title.style.fontSize);e=a.width,i=a.height;}return {width:e,height:i}}},{key:"getxAxisTimeScaleLabelsCoords",value:function(){var t,e=this.w;this.dCtx.timescaleLabels=e.globals.timescaleLabels.slice();var i=this.dCtx.timescaleLabels.map((function(t){return t.value})),a=i.reduce((function(t,e){return void 0===t?(console.error("You have possibly supplied invalid Date format. Please supply a valid JavaScript Date"),0):t.length>e.length?t:e}),0);return 1.05*(t=new p(this.dCtx.ctx).getTextRects(a,e.config.xaxis.labels.style.fontSize)).width*i.length>e.globals.gridWidth&&0!==e.config.xaxis.labels.rotate&&(e.globals.overlappingXLabels=!0),t}},{key:"additionalPaddingXLabels",value:function(t){var e=this,i=this.w,a=i.globals,s=i.config,r=s.xaxis.type,n=t.width;a.skipLastTimelinelabel=!1,a.skipFirstTimelinelabel=!1;var o=i.config.yaxis[0].opposite&&i.globals.isBarHorizontal,l=function(t,o){(function(t){return -1!==a.collapsedSeriesIndices.indexOf(t)})(o)||("datetime"!==r&&e.dCtx.gridPad.left<n/2-e.dCtx.yAxisWidthLeft&&!a.rotateXLabels&&!s.xaxis.labels.trim&&(e.dCtx.xPadLeft=n/2+1),function(t){if(e.dCtx.timescaleLabels&&e.dCtx.timescaleLabels.length){var s=e.dCtx.timescaleLabels[0],o=e.dCtx.timescaleLabels[e.dCtx.timescaleLabels.length-1].position+n/1.75-e.dCtx.yAxisWidthRight,l=s.position-n/1.75+e.dCtx.yAxisWidthLeft;o>a.gridWidth&&(a.skipLastTimelinelabel=!0),l<0&&(a.skipFirstTimelinelabel=!0);}else "datetime"===r?e.dCtx.gridPad.right<n&&!a.rotateXLabels&&(a.skipLastTimelinelabel=!0):"datetime"!==r&&e.dCtx.gridPad.right<n/2-e.dCtx.yAxisWidthRight&&!a.rotateXLabels&&("between"!==i.config.xaxis.tickPlacement||i.globals.isBarHorizontal)&&(e.dCtx.xPadRight=n/2+1);}());};s.yaxis.forEach((function(t,i){o?(e.dCtx.gridPad.left<n&&(e.dCtx.xPadLeft=n/2+1),e.dCtx.xPadRight=n/2+1):l(0,i);}));}}]),t}(),st=function(){function t(i){e(this,t),this.w=i.w,this.dCtx=i;}return a(t,[{key:"getyAxisLabelsCoords",value:function(){var t=this,e=this.w,i=[],a=10,s=new B(this.dCtx.ctx);return e.config.yaxis.map((function(r,n){var o=e.globals.yAxisScale[n];if(!s.isYAxisHidden(n)&&r.labels.show&&o.result.length){var l=e.globals.yLabelFormatters[n],h=String(o.niceMin).length>String(o.niceMax).length?o.niceMin:o.niceMax,c=l(h,{seriesIndex:n,dataPointIndex:-1,w:e}),d=c;if(void 0!==c&&0!==c.length||(c=h),e.globals.isBarHorizontal){a=0;var u=e.globals.labels.slice();c=l(c=g.getLargestStringFromArr(u),{seriesIndex:n,dataPointIndex:-1,w:e}),d=t.dCtx.dimHelpers.getLargestStringFromMultiArr(c,u);}var f=new p(t.dCtx.ctx),x=f.getTextRects(c,r.labels.style.fontSize),b=x;c!==d&&(b=f.getTextRects(d,r.labels.style.fontSize)),i.push({width:(b.width>x.width?b.width:x.width)+a,height:b.height>x.height?b.height:x.height});}else i.push({width:0,height:0});})),i}},{key:"getyAxisTitleCoords",value:function(){var t=this,e=this.w,i=[];return e.config.yaxis.map((function(e,a){if(e.show&&void 0!==e.title.text){var s=new p(t.dCtx.ctx).getTextRects(e.title.text,e.title.style.fontSize,e.title.style.fontFamily,"rotate(-90 0 0)",!1);i.push({width:s.width,height:s.height});}else i.push({width:0,height:0});})),i}},{key:"getTotalYAxisWidth",value:function(){var t=this.w,e=0,i=0,a=0,s=t.globals.yAxisScale.length>1?10:0,r=new B(this.dCtx.ctx),n=function(n,o){var l=t.config.yaxis[o].floating,h=0;n.width>0&&!l?(h=n.width+s,function(e){return t.globals.ignoreYAxisIndexes.indexOf(e)>-1}(o)&&(h=h-n.width-s)):h=l||r.isYAxisHidden(o)?0:5,t.config.yaxis[o].opposite?a+=h:i+=h,e+=h;};return t.globals.yLabelsCoords.map((function(t,e){n(t,e);})),t.globals.yTitleCoords.map((function(t,e){n(t,e);})),t.globals.isBarHorizontal&&(e=t.globals.yLabelsCoords[0].width+t.globals.yTitleCoords[0].width+15),this.dCtx.yAxisWidthLeft=i,this.dCtx.yAxisWidthRight=a,e}}]),t}(),rt=function(){function t(i){e(this,t),this.w=i.w,this.dCtx=i;}return a(t,[{key:"gridPadForColumnsInNumericAxis",value:function(t){var e=this.w;if(e.globals.noData||e.globals.allSeriesCollapsed)return 0;var i=e.config.chart.type,a=0,s="bar"===i||"rangeBar"===i?e.config.series.length:1;if(e.globals.comboBarCount>0&&(s=e.globals.comboBarCount),e.globals.collapsedSeries.forEach((function(t){"bar"!==t.type&&"rangeBar"!==t.type||(s-=1);})),e.config.chart.stacked&&(s=1),("bar"===i||"rangeBar"===i||e.globals.comboBarCount>0)&&e.globals.isXNumeric&&!e.globals.isBarHorizontal&&s>0){var r,n,o=Math.abs(e.globals.initialMaxX-e.globals.initialMinX);o<=3&&(o=e.globals.dataPoints),r=o/t,e.globals.minXDiff&&e.globals.minXDiff/r>0&&(n=e.globals.minXDiff/r),n>t/2&&(n/=2),(a=n/s*parseInt(e.config.plotOptions.bar.columnWidth,10)/100)<1&&(a=1),a=a/(s>1?1:1.5)+5,e.globals.barPadForNumericAxis=a;}return a}},{key:"gridPadFortitleSubtitle",value:function(){var t=this,e=this.w,i=e.globals,a=this.dCtx.isSparkline||!e.globals.axisCharts?0:10;["title","subtitle"].forEach((function(i){void 0!==e.config[i].text?a+=e.config[i].margin:a+=t.dCtx.isSparkline||!e.globals.axisCharts?0:5;}));var s=e.config.series.length>1||!e.globals.axisCharts||e.config.legend.showForSingleSeries;e.config.legend.show&&"bottom"===e.config.legend.position&&!e.config.legend.floating&&s&&(a+=10);var r=this.dCtx.dimHelpers.getTitleSubtitleCoords("title"),n=this.dCtx.dimHelpers.getTitleSubtitleCoords("subtitle");i.gridHeight=i.gridHeight-r.height-n.height-a,i.translateY=i.translateY+r.height+n.height+a;}},{key:"setGridXPosForDualYAxis",value:function(t,e){var i=this.w,a=new B(this.dCtx.ctx);i.config.yaxis.map((function(s,r){-1!==i.globals.ignoreYAxisIndexes.indexOf(r)||s.floating||a.isYAxisHidden(r)||(s.opposite&&(i.globals.translateX=i.globals.translateX-(e[r].width+t[r].width)-parseInt(i.config.yaxis[r].labels.style.fontSize,10)/1.2-12),i.globals.translateX<2&&(i.globals.translateX=2));}));}}]),t}(),nt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.lgRect={},this.yAxisWidth=0,this.yAxisWidthLeft=0,this.yAxisWidthRight=0,this.xAxisHeight=0,this.isSparkline=this.w.config.chart.sparkline.enabled,this.dimHelpers=new it(this),this.dimYAxis=new st(this),this.dimXAxis=new at(this),this.dimGrid=new rt(this),this.lgWidthForSideLegends=0,this.gridPad=this.w.config.grid.padding,this.xPadRight=0,this.xPadLeft=0;}return a(t,[{key:"plotCoords",value:function(){var t=this.w.globals;this.lgRect=this.dimHelpers.getLegendsRect(),t.axisCharts?this.setDimensionsForAxisCharts():this.setDimensionsForNonAxisCharts(),this.dimGrid.gridPadFortitleSubtitle(),t.gridHeight=t.gridHeight-this.gridPad.top-this.gridPad.bottom,t.gridWidth=t.gridWidth-this.gridPad.left-this.gridPad.right-this.xPadRight-this.xPadLeft;var e=this.dimGrid.gridPadForColumnsInNumericAxis(t.gridWidth);t.gridWidth=t.gridWidth-2*e,t.translateX=t.translateX+this.gridPad.left+this.xPadLeft+(e>0?e+4:0),t.translateY=t.translateY+this.gridPad.top;}},{key:"setDimensionsForAxisCharts",value:function(){var t=this,e=this.w,i=e.globals,a=this.dimYAxis.getyAxisLabelsCoords(),s=this.dimYAxis.getyAxisTitleCoords();e.globals.yLabelsCoords=[],e.globals.yTitleCoords=[],e.config.yaxis.map((function(t,i){e.globals.yLabelsCoords.push({width:a[i].width,index:i}),e.globals.yTitleCoords.push({width:s[i].width,index:i});})),this.yAxisWidth=this.dimYAxis.getTotalYAxisWidth();var r=this.dimXAxis.getxAxisLabelsCoords(),n=this.dimXAxis.getxAxisTitleCoords();this.conditionalChecksForAxisCoords(r,n),i.translateXAxisY=e.globals.rotateXLabels?this.xAxisHeight/8:-4,i.translateXAxisX=e.globals.rotateXLabels&&e.globals.isXNumeric&&e.config.xaxis.labels.rotate<=-45?-this.xAxisWidth/4:0,e.globals.isBarHorizontal&&(i.rotateXLabels=!1,i.translateXAxisY=parseInt(e.config.xaxis.labels.style.fontSize,10)/1.5*-1),i.translateXAxisY=i.translateXAxisY+e.config.xaxis.labels.offsetY,i.translateXAxisX=i.translateXAxisX+e.config.xaxis.labels.offsetX;var o=this.yAxisWidth,l=this.xAxisHeight;i.xAxisLabelsHeight=this.xAxisHeight,i.xAxisHeight=this.xAxisHeight;var h=10;("radar"===e.config.chart.type||this.isSparkline)&&(o=0,l=i.goldenPadding),this.isSparkline&&(this.lgRect={height:0,width:0},l=0,o=0,h=0),this.dimXAxis.additionalPaddingXLabels(r);var c=function(){i.translateX=o,i.gridHeight=i.svgHeight-t.lgRect.height-l-(t.isSparkline?0:e.globals.rotateXLabels?10:15),i.gridWidth=i.svgWidth-o;};switch("top"===e.config.xaxis.position&&(h=i.xAxisHeight-e.config.xaxis.axisTicks.height-5),e.config.legend.position){case"bottom":i.translateY=h,c();break;case"top":i.translateY=this.lgRect.height+h,c();break;case"left":i.translateY=h,i.translateX=this.lgRect.width+o,i.gridHeight=i.svgHeight-l-12,i.gridWidth=i.svgWidth-this.lgRect.width-o;break;case"right":i.translateY=h,i.translateX=o,i.gridHeight=i.svgHeight-l-12,i.gridWidth=i.svgWidth-this.lgRect.width-o-5;break;default:throw new Error("Legend position not supported")}this.dimGrid.setGridXPosForDualYAxis(s,a),new q(this.ctx).setYAxisXPosition(a,s);}},{key:"setDimensionsForNonAxisCharts",value:function(){var t=this.w,e=t.globals,i=t.config,a=0;t.config.legend.show&&!t.config.legend.floating&&(a=20);var s="pie"===i.chart.type||"polarArea"===i.chart.type||"donut"===i.chart.type?"pie":"radialBar",r=i.plotOptions[s].offsetY,n=i.plotOptions[s].offsetX;if(!i.legend.show||i.legend.floating)return e.gridHeight=e.svgHeight-i.grid.padding.left+i.grid.padding.right,e.gridWidth=e.gridHeight,e.translateY=r,void(e.translateX=n+(e.svgWidth-e.gridWidth)/2);switch(i.legend.position){case"bottom":e.gridHeight=e.svgHeight-this.lgRect.height-e.goldenPadding,e.gridWidth=e.gridHeight,e.translateY=r-10,e.translateX=n+(e.svgWidth-e.gridWidth)/2;break;case"top":e.gridHeight=e.svgHeight-this.lgRect.height-e.goldenPadding,e.gridWidth=e.gridHeight,e.translateY=this.lgRect.height+r+10,e.translateX=n+(e.svgWidth-e.gridWidth)/2;break;case"left":e.gridWidth=e.svgWidth-this.lgRect.width-a,e.gridHeight="auto"!==i.chart.height?e.svgHeight:e.gridWidth,e.translateY=r,e.translateX=n+this.lgRect.width+a;break;case"right":e.gridWidth=e.svgWidth-this.lgRect.width-a-5,e.gridHeight="auto"!==i.chart.height?e.svgHeight:e.gridWidth,e.translateY=r,e.translateX=n+10;break;default:throw new Error("Legend position not supported")}}},{key:"conditionalChecksForAxisCoords",value:function(t,e){var i=this.w;this.xAxisHeight=(t.height+e.height)*(i.globals.isMultiLineX?1.2:i.globals.LINE_HEIGHT_RATIO)+(i.globals.rotateXLabels?22:10),this.xAxisWidth=t.width,this.xAxisHeight-e.height>i.config.xaxis.labels.maxHeight&&(this.xAxisHeight=i.config.xaxis.labels.maxHeight),i.config.xaxis.labels.minHeight&&this.xAxisHeight<i.config.xaxis.labels.minHeight&&(this.xAxisHeight=i.config.xaxis.labels.minHeight),i.config.xaxis.floating&&(this.xAxisHeight=0);var a=0,s=0;i.config.yaxis.forEach((function(t){a+=t.labels.minWidth,s+=t.labels.maxWidth;})),this.yAxisWidth<a&&(this.yAxisWidth=a),this.yAxisWidth>s&&(this.yAxisWidth=s);}}]),t}(),ot=function(){function t(i){e(this,t),this.w=i.w,this.lgCtx=i;}return a(t,[{key:"getLegendStyles",value:function(){var t=document.createElement("style");t.setAttribute("type","text/css");var e=document.createTextNode("\t\n    \t\n      .apexcharts-legend {\t\n        display: flex;\t\n        overflow: auto;\t\n        padding: 0 10px;\t\n      }\t\n      .apexcharts-legend.position-bottom, .apexcharts-legend.position-top {\t\n        flex-wrap: wrap\t\n      }\t\n      .apexcharts-legend.position-right, .apexcharts-legend.position-left {\t\n        flex-direction: column;\t\n        bottom: 0;\t\n      }\t\n      .apexcharts-legend.position-bottom.apexcharts-align-left, .apexcharts-legend.position-top.apexcharts-align-left, .apexcharts-legend.position-right, .apexcharts-legend.position-left {\t\n        justify-content: flex-start;\t\n      }\t\n      .apexcharts-legend.position-bottom.apexcharts-align-center, .apexcharts-legend.position-top.apexcharts-align-center {\t\n        justify-content: center;  \t\n      }\t\n      .apexcharts-legend.position-bottom.apexcharts-align-right, .apexcharts-legend.position-top.apexcharts-align-right {\t\n        justify-content: flex-end;\t\n      }\t\n      .apexcharts-legend-series {\t\n        cursor: pointer;\t\n        line-height: normal;\t\n      }\t\n      .apexcharts-legend.position-bottom .apexcharts-legend-series, .apexcharts-legend.position-top .apexcharts-legend-series{\t\n        display: flex;\t\n        align-items: center;\t\n      }\t\n      .apexcharts-legend-text {\t\n        position: relative;\t\n        font-size: 14px;\t\n      }\t\n      .apexcharts-legend-text *, .apexcharts-legend-marker * {\t\n        pointer-events: none;\t\n      }\t\n      .apexcharts-legend-marker {\t\n        position: relative;\t\n        display: inline-block;\t\n        cursor: pointer;\t\n        margin-right: 3px;\t\n        border-style: solid;\n      }\t\n      \t\n      .apexcharts-legend.apexcharts-align-right .apexcharts-legend-series, .apexcharts-legend.apexcharts-align-left .apexcharts-legend-series{\t\n        display: inline-block;\t\n      }\t\n      .apexcharts-legend-series.apexcharts-no-click {\t\n        cursor: auto;\t\n      }\t\n      .apexcharts-legend .apexcharts-hidden-zero-series, .apexcharts-legend .apexcharts-hidden-null-series {\t\n        display: none !important;\t\n      }\t\n      .apexcharts-inactive-legend {\t\n        opacity: 0.45;\t\n      }");return t.appendChild(e),t}},{key:"getLegendBBox",value:function(){var t=this.w.globals.dom.baseEl.querySelector(".apexcharts-legend").getBoundingClientRect(),e=t.width;return {clwh:t.height,clww:e}}},{key:"appendToForeignObject",value:function(){var t=this.w.globals;t.dom.elLegendForeign=document.createElementNS(t.SVGNS,"foreignObject");var e=t.dom.elLegendForeign;e.setAttribute("x",0),e.setAttribute("y",0),e.setAttribute("width",t.svgWidth),e.setAttribute("height",t.svgHeight),t.dom.elLegendWrap.setAttribute("xmlns","http://www.w3.org/1999/xhtml"),e.appendChild(t.dom.elLegendWrap),e.appendChild(this.getLegendStyles()),t.dom.Paper.node.insertBefore(e,t.dom.elGraphical.node);}},{key:"toggleDataSeries",value:function(t,e){var i=this,a=this.w;if(a.globals.axisCharts||"radialBar"===a.config.chart.type){a.globals.resized=!0;var s=null,r=null;if(a.globals.risingSeries=[],a.globals.axisCharts?(s=a.globals.dom.baseEl.querySelector(".apexcharts-series[data\\:realIndex='".concat(t,"']")),r=parseInt(s.getAttribute("data:realIndex"),10)):(s=a.globals.dom.baseEl.querySelector(".apexcharts-series[rel='".concat(t+1,"']")),r=parseInt(s.getAttribute("rel"),10)-1),e)[{cs:a.globals.collapsedSeries,csi:a.globals.collapsedSeriesIndices},{cs:a.globals.ancillaryCollapsedSeries,csi:a.globals.ancillaryCollapsedSeriesIndices}].forEach((function(t){i.riseCollapsedSeries(t.cs,t.csi,r);}));else this.hideSeries({seriesEl:s,realIndex:r});}else {var n=a.globals.dom.Paper.select(" .apexcharts-series[rel='".concat(t+1,"'] path")),o=a.config.chart.type;if("pie"===o||"polarArea"===o||"donut"===o){var l=a.config.plotOptions.pie.donut.labels;new p(this.lgCtx.ctx).pathMouseDown(n.members[0],null),this.lgCtx.ctx.pie.printDataLabelsInner(n.members[0].node,l);}n.fire("click");}}},{key:"hideSeries",value:function(t){var e=t.seriesEl,i=t.realIndex,a=this.w,s=g.clone(a.config.series);if(a.globals.axisCharts){var r=!1;if(a.config.yaxis[i]&&a.config.yaxis[i].show&&a.config.yaxis[i].showAlways&&(r=!0,a.globals.ancillaryCollapsedSeriesIndices.indexOf(i)<0&&(a.globals.ancillaryCollapsedSeries.push({index:i,data:s[i].data.slice(),type:e.parentNode.className.baseVal.split("-")[1]}),a.globals.ancillaryCollapsedSeriesIndices.push(i))),!r){a.globals.collapsedSeries.push({index:i,data:s[i].data.slice(),type:e.parentNode.className.baseVal.split("-")[1]}),a.globals.collapsedSeriesIndices.push(i);var n=a.globals.risingSeries.indexOf(i);a.globals.risingSeries.splice(n,1);}s[i].data=[];}else a.globals.collapsedSeries.push({index:i,data:s[i]}),a.globals.collapsedSeriesIndices.push(i),s[i]=0;for(var o=e.childNodes,l=0;l<o.length;l++)o[l].classList.contains("apexcharts-series-markers-wrap")&&(o[l].classList.contains("apexcharts-hide")?o[l].classList.remove("apexcharts-hide"):o[l].classList.add("apexcharts-hide"));a.globals.allSeriesCollapsed=a.globals.collapsedSeries.length===a.config.series.length,this.lgCtx.ctx.updateHelpers._updateSeries(s,a.config.chart.animations.dynamicAnimation.enabled);}},{key:"riseCollapsedSeries",value:function(t,e,i){var a=this.w;if(t.length>0)for(var s=0;s<t.length;s++)t[s].index===i&&(a.globals.axisCharts?(a.config.series[i].data=t[s].data.slice(),t.splice(s,1),e.splice(s,1),a.globals.risingSeries.push(i)):(a.config.series[i]=t[s].data,t.splice(s,1),e.splice(s,1),a.globals.risingSeries.push(i)),this.lgCtx.ctx.updateHelpers._updateSeries(a.config.series,a.config.chart.animations.dynamicAnimation.enabled));}}]),t}(),lt=function(){function t(i,a){e(this,t),this.ctx=i,this.w=i.w,this.onLegendClick=this.onLegendClick.bind(this),this.onLegendHovered=this.onLegendHovered.bind(this),this.isBarsDistributed="bar"===this.w.config.chart.type&&this.w.config.plotOptions.bar.distributed&&1===this.w.config.series.length,this.legendHelpers=new ot(this);}return a(t,[{key:"init",value:function(){var t=this.w,e=t.globals,i=t.config;if((i.legend.showForSingleSeries&&1===e.series.length||this.isBarsDistributed||e.series.length>1||!e.axisCharts)&&i.legend.show){for(;e.dom.elLegendWrap.firstChild;)e.dom.elLegendWrap.removeChild(e.dom.elLegendWrap.firstChild);this.drawLegends(),g.isIE11()?document.getElementsByTagName("head")[0].appendChild(this.legendHelpers.getLegendStyles()):this.legendHelpers.appendToForeignObject(),"bottom"===i.legend.position||"top"===i.legend.position?this.legendAlignHorizontal():"right"!==i.legend.position&&"left"!==i.legend.position||this.legendAlignVertical();}}},{key:"drawLegends",value:function(){var t=this.w,e=t.config.legend.fontFamily,i=t.globals.seriesNames,a=t.globals.colors.slice();if("heatmap"===t.config.chart.type){var s=t.config.plotOptions.heatmap.colorScale.ranges;i=s.map((function(t){return t.name?t.name:t.from+" - "+t.to})),a=s.map((function(t){return t.color}));}else this.isBarsDistributed&&(i=t.globals.labels.slice());for(var r=t.globals.legendFormatter,n=t.config.legend.inverseOrder,o=n?i.length-1:0;n?o>=0:o<=i.length-1;n?o--:o++){var l=r(i[o],{seriesIndex:o,w:t}),h=!1,c=!1;if(t.globals.collapsedSeries.length>0)for(var d=0;d<t.globals.collapsedSeries.length;d++)t.globals.collapsedSeries[d].index===o&&(h=!0);if(t.globals.ancillaryCollapsedSeriesIndices.length>0)for(var g=0;g<t.globals.ancillaryCollapsedSeriesIndices.length;g++)t.globals.ancillaryCollapsedSeriesIndices[g]===o&&(c=!0);var u=document.createElement("span");u.classList.add("apexcharts-legend-marker");var f=t.config.legend.markers.offsetX,x=t.config.legend.markers.offsetY,b=t.config.legend.markers.height,v=t.config.legend.markers.width,y=t.config.legend.markers.strokeWidth,w=t.config.legend.markers.strokeColor,k=t.config.legend.markers.radius,A=u.style;A.background=a[o],A.color=a[o],t.config.legend.markers.fillColors&&t.config.legend.markers.fillColors[o]&&(A.background=t.config.legend.markers.fillColors[o]),A.height=Array.isArray(b)?parseFloat(b[o])+"px":parseFloat(b)+"px",A.width=Array.isArray(v)?parseFloat(v[o])+"px":parseFloat(v)+"px",A.left=Array.isArray(f)?f[o]:f,A.top=Array.isArray(x)?x[o]:x,A.borderWidth=Array.isArray(y)?y[o]:y,A.borderColor=Array.isArray(w)?w[o]:w,A.borderRadius=Array.isArray(k)?parseFloat(k[o])+"px":parseFloat(k)+"px",t.config.legend.markers.customHTML&&(Array.isArray(t.config.legend.markers.customHTML)?t.config.legend.markers.customHTML[o]&&(u.innerHTML=t.config.legend.markers.customHTML[o]()):u.innerHTML=t.config.legend.markers.customHTML()),p.setAttrs(u,{rel:o+1,"data:collapsed":h||c}),(h||c)&&u.classList.add("apexcharts-inactive-legend");var S=document.createElement("div"),C=document.createElement("span");C.classList.add("apexcharts-legend-text"),C.innerHTML=Array.isArray(l)?l.join(" "):l;var L=t.config.legend.labels.useSeriesColors?t.globals.colors[o]:t.config.legend.labels.colors;L||(L=t.config.chart.foreColor),C.style.color=L,C.style.fontSize=parseFloat(t.config.legend.fontSize)+"px",C.style.fontWeight=t.config.legend.fontWeight,C.style.fontFamily=e||t.config.chart.fontFamily,p.setAttrs(C,{rel:o+1,i:o,"data:default-text":encodeURIComponent(l),"data:collapsed":h||c}),S.appendChild(u),S.appendChild(C);var P=new m(this.ctx);if(!t.config.legend.showForZeroSeries)0===P.getSeriesTotalByIndex(o)&&P.seriesHaveSameValues(o)&&!P.isSeriesNull(o)&&-1===t.globals.collapsedSeriesIndices.indexOf(o)&&-1===t.globals.ancillaryCollapsedSeriesIndices.indexOf(o)&&S.classList.add("apexcharts-hidden-zero-series");t.config.legend.showForNullSeries||P.isSeriesNull(o)&&-1===t.globals.collapsedSeriesIndices.indexOf(o)&&-1===t.globals.ancillaryCollapsedSeriesIndices.indexOf(o)&&S.classList.add("apexcharts-hidden-null-series"),t.globals.dom.elLegendWrap.appendChild(S),t.globals.dom.elLegendWrap.classList.add("apexcharts-align-".concat(t.config.legend.horizontalAlign)),t.globals.dom.elLegendWrap.classList.add("position-"+t.config.legend.position),S.classList.add("apexcharts-legend-series"),S.style.margin="".concat(t.config.legend.itemMargin.vertical,"px ").concat(t.config.legend.itemMargin.horizontal,"px"),t.globals.dom.elLegendWrap.style.width=t.config.legend.width?t.config.legend.width+"px":"",t.globals.dom.elLegendWrap.style.height=t.config.legend.height?t.config.legend.height+"px":"",p.setAttrs(S,{rel:o+1,"data:collapsed":h||c}),(h||c)&&S.classList.add("apexcharts-inactive-legend"),t.config.legend.onItemClick.toggleDataSeries||S.classList.add("apexcharts-no-click");}"heatmap"!==t.config.chart.type&&!this.isBarsDistributed&&t.config.legend.onItemClick.toggleDataSeries&&t.globals.dom.elWrap.addEventListener("click",this.onLegendClick,!0),t.config.legend.onItemHover.highlightDataSeries&&(t.globals.dom.elWrap.addEventListener("mousemove",this.onLegendHovered,!0),t.globals.dom.elWrap.addEventListener("mouseout",this.onLegendHovered,!0));}},{key:"setLegendWrapXY",value:function(t,e){var i=this.w,a=i.globals.dom.baseEl.querySelector(".apexcharts-legend"),s=a.getBoundingClientRect(),r=0,n=0;if("bottom"===i.config.legend.position)n+=i.globals.svgHeight-s.height/2;else if("top"===i.config.legend.position){var o=new nt(this.ctx),l=o.dimHelpers.getTitleSubtitleCoords("title").height,h=o.dimHelpers.getTitleSubtitleCoords("subtitle").height;n=n+(l>0?l-10:0)+(h>0?h-10:0);}a.style.position="absolute",r=r+t+i.config.legend.offsetX,n=n+e+i.config.legend.offsetY,a.style.left=r+"px",a.style.top=n+"px","bottom"===i.config.legend.position?(a.style.top="auto",a.style.bottom=5-i.config.legend.offsetY+"px"):"right"===i.config.legend.position&&(a.style.left="auto",a.style.right=25+i.config.legend.offsetX+"px");["width","height"].forEach((function(t){a.style[t]&&(a.style[t]=parseInt(i.config.legend[t],10)+"px");}));}},{key:"legendAlignHorizontal",value:function(){var t=this.w;t.globals.dom.baseEl.querySelector(".apexcharts-legend").style.right=0;var e=this.legendHelpers.getLegendBBox(),i=new nt(this.ctx),a=i.dimHelpers.getTitleSubtitleCoords("title"),s=i.dimHelpers.getTitleSubtitleCoords("subtitle"),r=0;"bottom"===t.config.legend.position?r=-e.clwh/1.8:"top"===t.config.legend.position&&(r=a.height+s.height+t.config.title.margin+t.config.subtitle.margin-10),this.setLegendWrapXY(20,r);}},{key:"legendAlignVertical",value:function(){var t=this.w,e=this.legendHelpers.getLegendBBox(),i=0;"left"===t.config.legend.position&&(i=20),"right"===t.config.legend.position&&(i=t.globals.svgWidth-e.clww-10),this.setLegendWrapXY(i,20);}},{key:"onLegendHovered",value:function(t){var e=this.w,i=t.target.classList.contains("apexcharts-legend-text")||t.target.classList.contains("apexcharts-legend-marker");if("heatmap"===e.config.chart.type||this.isBarsDistributed){if(i){var a=parseInt(t.target.getAttribute("rel"),10)-1;this.ctx.events.fireEvent("legendHover",[this.ctx,a,this.w]),new M(this.ctx).highlightRangeInSeries(t,t.target);}}else !t.target.classList.contains("apexcharts-inactive-legend")&&i&&new M(this.ctx).toggleSeriesOnHover(t,t.target);}},{key:"onLegendClick",value:function(t){if(t.target.classList.contains("apexcharts-legend-text")||t.target.classList.contains("apexcharts-legend-marker")){var e=parseInt(t.target.getAttribute("rel"),10)-1,i="true"===t.target.getAttribute("data:collapsed"),a=this.w.config.chart.events.legendClick;"function"==typeof a&&a(this.ctx,e,this.w),this.ctx.events.fireEvent("legendClick",[this.ctx,e,this.w]);var s=this.w.config.legend.markers.onClick;"function"==typeof s&&t.target.classList.contains("apexcharts-legend-marker")&&(s(this.ctx,e,this.w),this.ctx.events.fireEvent("legendMarkerClick",[this.ctx,e,this.w])),this.legendHelpers.toggleDataSeries(e,i);}}}]),t}(),ht=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.ev=this.w.config.chart.events,this.selectedClass="apexcharts-selected",this.localeValues=this.w.globals.locale.toolbar;}return a(t,[{key:"createToolbar",value:function(){var t=this,e=this.w,i=function(){return document.createElement("div")},a=i();if(a.setAttribute("class","apexcharts-toolbar"),a.style.top=e.config.chart.toolbar.offsetY+"px",a.style.right=3-e.config.chart.toolbar.offsetX+"px",e.globals.dom.elWrap.appendChild(a),this.elZoom=i(),this.elZoomIn=i(),this.elZoomOut=i(),this.elPan=i(),this.elSelection=i(),this.elZoomReset=i(),this.elMenuIcon=i(),this.elMenu=i(),this.elCustomIcons=[],this.t=e.config.chart.toolbar.tools,Array.isArray(this.t.customIcons))for(var s=0;s<this.t.customIcons.length;s++)this.elCustomIcons.push(i());var r=[],n=function(i,a,s){var n=i.toLowerCase();t.t[n]&&e.config.chart.zoom.enabled&&r.push({el:a,icon:"string"==typeof t.t[n]?t.t[n]:s,title:t.localeValues[i],class:"apexcharts-".concat(n,"-icon")});};n("zoomIn",this.elZoomIn,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path d="M0 0h24v24H0z" fill="none"/>\n    <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>\n</svg>\n'),n("zoomOut",this.elZoomOut,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path d="M0 0h24v24H0z" fill="none"/>\n    <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>\n</svg>\n');var o=function(i){t.t[i]&&e.config.chart[i].enabled&&r.push({el:"zoom"===i?t.elZoom:t.elSelection,icon:"string"==typeof t.t[i]?t.t[i]:"zoom"===i?'<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">\n    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>\n    <path d="M0 0h24v24H0V0z" fill="none"/>\n    <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>\n</svg>':'<svg fill="#6E8192" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\n    <path d="M0 0h24v24H0z" fill="none"/>\n    <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/>\n</svg>',title:t.localeValues["zoom"===i?"selectionZoom":"selection"],class:e.globals.isTouchDevice?"apexcharts-element-hidden":"apexcharts-".concat(i,"-icon")});};o("zoom"),o("selection"),this.t.pan&&e.config.chart.zoom.enabled&&r.push({el:this.elPan,icon:"string"==typeof this.t.pan?this.t.pan:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="24" viewBox="0 0 24 24" width="24">\n    <defs>\n        <path d="M0 0h24v24H0z" id="a"/>\n    </defs>\n    <clipPath id="b">\n        <use overflow="visible" xlink:href="#a"/>\n    </clipPath>\n    <path clip-path="url(#b)" d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z"/>\n</svg>',title:this.localeValues.pan,class:e.globals.isTouchDevice?"apexcharts-element-hidden":"apexcharts-pan-icon"}),n("reset",this.elZoomReset,'<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\n    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>\n    <path d="M0 0h24v24H0z" fill="none"/>\n</svg>'),this.t.download&&r.push({el:this.elMenuIcon,icon:"string"==typeof this.t.download?this.t.download:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',title:this.localeValues.menu,class:"apexcharts-menu-icon"});for(var l=0;l<this.elCustomIcons.length;l++)r.push({el:this.elCustomIcons[l],icon:this.t.customIcons[l].icon,title:this.t.customIcons[l].title,index:this.t.customIcons[l].index,class:"apexcharts-toolbar-custom-icon "+this.t.customIcons[l].class});r.forEach((function(t,e){t.index&&g.moveIndexInArray(r,e,t.index);}));for(var h=0;h<r.length;h++)p.setAttrs(r[h].el,{class:r[h].class,title:r[h].title}),r[h].el.innerHTML=r[h].icon,a.appendChild(r[h].el);this._createHamburgerMenu(a),e.globals.zoomEnabled?this.elZoom.classList.add(this.selectedClass):e.globals.panEnabled?this.elPan.classList.add(this.selectedClass):e.globals.selectionEnabled&&this.elSelection.classList.add(this.selectedClass),this.addToolbarEventListeners();}},{key:"_createHamburgerMenu",value:function(t){this.elMenuItems=[],t.appendChild(this.elMenu),p.setAttrs(this.elMenu,{class:"apexcharts-menu"});var e=[{name:"exportSVG",title:this.localeValues.exportToSVG},{name:"exportPNG",title:this.localeValues.exportToPNG},{name:"exportCSV",title:this.localeValues.exportToCSV}];this.w.globals.allSeriesHasEqualX||e.splice(2,1);for(var i=0;i<e.length;i++)this.elMenuItems.push(document.createElement("div")),this.elMenuItems[i].innerHTML=e[i].title,p.setAttrs(this.elMenuItems[i],{class:"apexcharts-menu-item ".concat(e[i].name),title:e[i].title}),this.elMenu.appendChild(this.elMenuItems[i]);}},{key:"addToolbarEventListeners",value:function(){var t=this;this.elZoomReset.addEventListener("click",this.handleZoomReset.bind(this)),this.elSelection.addEventListener("click",this.toggleZoomSelection.bind(this,"selection")),this.elZoom.addEventListener("click",this.toggleZoomSelection.bind(this,"zoom")),this.elZoomIn.addEventListener("click",this.handleZoomIn.bind(this)),this.elZoomOut.addEventListener("click",this.handleZoomOut.bind(this)),this.elPan.addEventListener("click",this.togglePanning.bind(this)),this.elMenuIcon.addEventListener("click",this.toggleMenu.bind(this)),this.elMenuItems.forEach((function(e){e.classList.contains("exportSVG")?e.addEventListener("click",t.handleDownload.bind(t,"svg")):e.classList.contains("exportPNG")?e.addEventListener("click",t.handleDownload.bind(t,"png")):e.classList.contains("exportCSV")&&e.addEventListener("click",t.handleDownload.bind(t,"csv"));}));for(var e=0;e<this.t.customIcons.length;e++)this.elCustomIcons[e].addEventListener("click",this.t.customIcons[e].click.bind(this,this.ctx,this.ctx.w));}},{key:"toggleZoomSelection",value:function(t){this.ctx.getSyncedCharts().forEach((function(e){e.ctx.toolbar.toggleOtherControls();var i="selection"===t?e.ctx.toolbar.elSelection:e.ctx.toolbar.elZoom,a="selection"===t?"selectionEnabled":"zoomEnabled";e.w.globals[a]=!e.w.globals[a],i.classList.contains(e.ctx.toolbar.selectedClass)?i.classList.remove(e.ctx.toolbar.selectedClass):i.classList.add(e.ctx.toolbar.selectedClass);}));}},{key:"getToolbarIconsReference",value:function(){var t=this.w;this.elZoom||(this.elZoom=t.globals.dom.baseEl.querySelector(".apexcharts-zoom-icon")),this.elPan||(this.elPan=t.globals.dom.baseEl.querySelector(".apexcharts-pan-icon")),this.elSelection||(this.elSelection=t.globals.dom.baseEl.querySelector(".apexcharts-selection-icon"));}},{key:"enableZoomPanFromToolbar",value:function(t){this.toggleOtherControls(),"pan"===t?this.w.globals.panEnabled=!0:this.w.globals.zoomEnabled=!0;var e="pan"===t?this.elPan:this.elZoom,i="pan"===t?this.elZoom:this.elPan;e&&e.classList.add(this.selectedClass),i&&i.classList.remove(this.selectedClass);}},{key:"togglePanning",value:function(){this.ctx.getSyncedCharts().forEach((function(t){t.ctx.toolbar.toggleOtherControls(),t.w.globals.panEnabled=!t.w.globals.panEnabled,t.ctx.toolbar.elPan.classList.contains(t.ctx.toolbar.selectedClass)?t.ctx.toolbar.elPan.classList.remove(t.ctx.toolbar.selectedClass):t.ctx.toolbar.elPan.classList.add(t.ctx.toolbar.selectedClass);}));}},{key:"toggleOtherControls",value:function(){var t=this,e=this.w;e.globals.panEnabled=!1,e.globals.zoomEnabled=!1,e.globals.selectionEnabled=!1,this.getToolbarIconsReference(),[this.elPan,this.elSelection,this.elZoom].forEach((function(e){e&&e.classList.remove(t.selectedClass);}));}},{key:"handleZoomIn",value:function(){var t=this.w,e=(t.globals.minX+t.globals.maxX)/2,i=(t.globals.minX+e)/2,a=(t.globals.maxX+e)/2,s=this._getNewMinXMaxX(i,a);t.globals.disableZoomIn||this.zoomUpdateOptions(s.minX,s.maxX);}},{key:"handleZoomOut",value:function(){var t=this.w;if(!("datetime"===t.config.xaxis.type&&new Date(t.globals.minX).getUTCFullYear()<1e3)){var e=(t.globals.minX+t.globals.maxX)/2,i=t.globals.minX-(e-t.globals.minX),a=t.globals.maxX-(e-t.globals.maxX),s=this._getNewMinXMaxX(i,a);t.globals.disableZoomOut||this.zoomUpdateOptions(s.minX,s.maxX);}}},{key:"_getNewMinXMaxX",value:function(t,e){var i=this.w.config.xaxis.convertedCatToNumeric;return {minX:i?Math.floor(t):t,maxX:i?Math.floor(e):e}}},{key:"zoomUpdateOptions",value:function(t,e){var i=this.w;if(void 0!==t||void 0!==e){if(!(i.config.xaxis.convertedCatToNumeric&&(t<1&&(t=1,e=i.globals.dataPoints),e-t<2))){var a={min:t,max:e},s=this.getBeforeZoomRange(a);s&&(a=s.xaxis);var r={xaxis:a},n=g.clone(i.globals.initialConfig.yaxis);if(i.config.chart.zoom.autoScaleYaxis)n=new j(this.ctx).autoScaleY(this.ctx,n,{xaxis:a});i.config.chart.group||(r.yaxis=n),this.w.globals.zoomed=!0,this.ctx.updateHelpers._updateOptions(r,!1,this.w.config.chart.animations.dynamicAnimation.enabled),this.zoomCallback(a,n);}}else this.handleZoomReset();}},{key:"zoomCallback",value:function(t,e){"function"==typeof this.ev.zoomed&&this.ev.zoomed(this.ctx,{xaxis:t,yaxis:e});}},{key:"getBeforeZoomRange",value:function(t,e){var i=null;return "function"==typeof this.ev.beforeZoom&&(i=this.ev.beforeZoom(this,{xaxis:t,yaxis:e})),i}},{key:"toggleMenu",value:function(){var t=this;window.setTimeout((function(){t.elMenu.classList.contains("apexcharts-menu-open")?t.elMenu.classList.remove("apexcharts-menu-open"):t.elMenu.classList.add("apexcharts-menu-open");}),0);}},{key:"handleDownload",value:function(t){var e=this.w,i=new V(this.ctx);switch(t){case"svg":i.exportToSVG(this.ctx);break;case"png":i.exportToPng(this.ctx);break;case"csv":i.exportToCSV({series:e.config.series});}}},{key:"handleZoomReset",value:function(t){this.ctx.getSyncedCharts().forEach((function(t){var e=t.w;e.globals.lastXAxis.min=void 0,e.globals.lastXAxis.max=void 0,t.updateHelpers.revertDefaultAxisMinMax(),"function"==typeof e.config.chart.events.zoomed&&t.ctx.toolbar.zoomCallback({min:e.config.xaxis.min,max:e.config.xaxis.max}),e.globals.zoomed=!1;var i=t.ctx.series.emptyCollapsedSeries(g.clone(e.globals.initialSeries));t.updateHelpers._updateSeries(i,e.config.chart.animations.dynamicAnimation.enabled);}));}},{key:"destroy",value:function(){this.elZoom=null,this.elZoomIn=null,this.elZoomOut=null,this.elPan=null,this.elSelection=null,this.elZoomReset=null,this.elMenuIcon=null;}}]),t}(),ct=function(t){function i(t){var a;return e(this,i),(a=c(this,l(i).call(this,t))).ctx=t,a.w=t.w,a.dragged=!1,a.graphics=new p(a.ctx),a.eventList=["mousedown","mouseleave","mousemove","touchstart","touchmove","mouseup","touchend"],a.clientX=0,a.clientY=0,a.startX=0,a.endX=0,a.dragX=0,a.startY=0,a.endY=0,a.dragY=0,a.moveDirection="none",a}return o(i,ht),a(i,[{key:"init",value:function(t){var e=this,i=t.xyRatios,a=this.w,s=this;this.xyRatios=i,this.zoomRect=this.graphics.drawRect(0,0,0,0),this.selectionRect=this.graphics.drawRect(0,0,0,0),this.gridRect=a.globals.dom.baseEl.querySelector(".apexcharts-grid"),this.zoomRect.node.classList.add("apexcharts-zoom-rect"),this.selectionRect.node.classList.add("apexcharts-selection-rect"),a.globals.dom.elGraphical.add(this.zoomRect),a.globals.dom.elGraphical.add(this.selectionRect),"x"===a.config.chart.selection.type?this.slDraggableRect=this.selectionRect.draggable({minX:0,minY:0,maxX:a.globals.gridWidth,maxY:a.globals.gridHeight}).on("dragmove",this.selectionDragging.bind(this,"dragging")):"y"===a.config.chart.selection.type?this.slDraggableRect=this.selectionRect.draggable({minX:0,maxX:a.globals.gridWidth}).on("dragmove",this.selectionDragging.bind(this,"dragging")):this.slDraggableRect=this.selectionRect.draggable().on("dragmove",this.selectionDragging.bind(this,"dragging")),this.preselectedSelection(),this.hoverArea=a.globals.dom.baseEl.querySelector(a.globals.chartClass),this.hoverArea.classList.add("apexcharts-zoomable"),this.eventList.forEach((function(t){e.hoverArea.addEventListener(t,s.svgMouseEvents.bind(s,i),{capture:!1,passive:!0});}));}},{key:"destroy",value:function(){this.slDraggableRect&&(this.slDraggableRect.draggable(!1),this.slDraggableRect.off(),this.selectionRect.off()),this.selectionRect=null,this.zoomRect=null,this.gridRect=null;}},{key:"svgMouseEvents",value:function(t,e){var i=this.w,a=this,s=this.ctx.toolbar,r=i.globals.zoomEnabled?i.config.chart.zoom.type:i.config.chart.selection.type,n=i.config.chart.toolbar.autoSelected;if(e.shiftKey?(this.shiftWasPressed=!0,s.enableZoomPanFromToolbar("pan"===n?"zoom":"pan")):this.shiftWasPressed&&(s.enableZoomPanFromToolbar(n),this.shiftWasPressed=!1),!(e.target.classList.contains("apexcharts-selection-rect")||e.target.parentNode.classList.contains("apexcharts-toolbar"))){if(a.clientX="touchmove"===e.type||"touchstart"===e.type?e.touches[0].clientX:"touchend"===e.type?e.changedTouches[0].clientX:e.clientX,a.clientY="touchmove"===e.type||"touchstart"===e.type?e.touches[0].clientY:"touchend"===e.type?e.changedTouches[0].clientY:e.clientY,"mousedown"===e.type&&1===e.which){var o=a.gridRect.getBoundingClientRect();a.startX=a.clientX-o.left,a.startY=a.clientY-o.top,a.dragged=!1,a.w.globals.mousedown=!0;}if(("mousemove"===e.type&&1===e.which||"touchmove"===e.type)&&(a.dragged=!0,i.globals.panEnabled?(i.globals.selection=null,a.w.globals.mousedown&&a.panDragging({context:a,zoomtype:r,xyRatios:t})):(a.w.globals.mousedown&&i.globals.zoomEnabled||a.w.globals.mousedown&&i.globals.selectionEnabled)&&(a.selection=a.selectionDrawing({context:a,zoomtype:r}))),"mouseup"===e.type||"touchend"===e.type||"mouseleave"===e.type){var l=a.gridRect.getBoundingClientRect();a.w.globals.mousedown&&(a.endX=a.clientX-l.left,a.endY=a.clientY-l.top,a.dragX=Math.abs(a.endX-a.startX),a.dragY=Math.abs(a.endY-a.startY),(i.globals.zoomEnabled||i.globals.selectionEnabled)&&a.selectionDrawn({context:a,zoomtype:r}),i.globals.panEnabled&&i.config.xaxis.convertedCatToNumeric&&a.delayedPanScrolled()),i.globals.zoomEnabled&&a.hideSelectionRect(this.selectionRect),a.dragged=!1,a.w.globals.mousedown=!1;}this.makeSelectionRectDraggable();}}},{key:"makeSelectionRectDraggable",value:function(){var t=this.w;if(this.selectionRect){var e=this.selectionRect.node.getBoundingClientRect();e.width>0&&e.height>0&&this.slDraggableRect.selectize({points:"l, r",pointSize:8,pointType:"rect"}).resize({constraint:{minX:0,minY:0,maxX:t.globals.gridWidth,maxY:t.globals.gridHeight}}).on("resizing",this.selectionDragging.bind(this,"resizing"));}}},{key:"preselectedSelection",value:function(){var t=this.w,e=this.xyRatios;if(!t.globals.zoomEnabled)if(void 0!==t.globals.selection&&null!==t.globals.selection)this.drawSelectionRect(t.globals.selection);else if(void 0!==t.config.chart.selection.xaxis.min&&void 0!==t.config.chart.selection.xaxis.max){var i=(t.config.chart.selection.xaxis.min-t.globals.minX)/e.xRatio,a={x:i,y:0,width:t.globals.gridWidth-(t.globals.maxX-t.config.chart.selection.xaxis.max)/e.xRatio-i,height:t.globals.gridHeight,translateX:0,translateY:0,selectionEnabled:!0};this.drawSelectionRect(a),this.makeSelectionRectDraggable(),"function"==typeof t.config.chart.events.selection&&t.config.chart.events.selection(this.ctx,{xaxis:{min:t.config.chart.selection.xaxis.min,max:t.config.chart.selection.xaxis.max},yaxis:{}});}}},{key:"drawSelectionRect",value:function(t){var e=t.x,i=t.y,a=t.width,s=t.height,r=t.translateX,n=void 0===r?0:r,o=t.translateY,l=void 0===o?0:o,h=this.w,c=this.zoomRect,d=this.selectionRect;if(this.dragged||null!==h.globals.selection){var g={transform:"translate("+n+", "+l+")"};h.globals.zoomEnabled&&this.dragged&&(a<0&&(a=1),c.attr({x:e,y:i,width:a,height:s,fill:h.config.chart.zoom.zoomedArea.fill.color,"fill-opacity":h.config.chart.zoom.zoomedArea.fill.opacity,stroke:h.config.chart.zoom.zoomedArea.stroke.color,"stroke-width":h.config.chart.zoom.zoomedArea.stroke.width,"stroke-opacity":h.config.chart.zoom.zoomedArea.stroke.opacity}),p.setAttrs(c.node,g)),h.globals.selectionEnabled&&(d.attr({x:e,y:i,width:a>0?a:0,height:s>0?s:0,fill:h.config.chart.selection.fill.color,"fill-opacity":h.config.chart.selection.fill.opacity,stroke:h.config.chart.selection.stroke.color,"stroke-width":h.config.chart.selection.stroke.width,"stroke-dasharray":h.config.chart.selection.stroke.dashArray,"stroke-opacity":h.config.chart.selection.stroke.opacity}),p.setAttrs(d.node,g));}}},{key:"hideSelectionRect",value:function(t){t&&t.attr({x:0,y:0,width:0,height:0});}},{key:"selectionDrawing",value:function(t){var e=t.context,i=t.zoomtype,a=this.w,s=e,r=this.gridRect.getBoundingClientRect(),n=s.startX-1,o=s.startY,l=!1,h=!1,c=s.clientX-r.left-n,d=s.clientY-r.top-o,g={};return Math.abs(c+n)>a.globals.gridWidth?c=a.globals.gridWidth-n:s.clientX-r.left<0&&(c=n),n>s.clientX-r.left&&(l=!0,c=Math.abs(c)),o>s.clientY-r.top&&(h=!0,d=Math.abs(d)),g="x"===i?{x:l?n-c:n,y:0,width:c,height:a.globals.gridHeight}:"y"===i?{x:0,y:h?o-d:o,width:a.globals.gridWidth,height:d}:{x:l?n-c:n,y:h?o-d:o,width:c,height:d},s.drawSelectionRect(g),s.selectionDragging("resizing"),g}},{key:"selectionDragging",value:function(t,e){var i=this,a=this.w,s=this.xyRatios,r=this.selectionRect,n=0;"resizing"===t&&(n=30);var o=function(t){return parseFloat(r.node.getAttribute(t))},l={x:o("x"),y:o("y"),width:o("width"),height:o("height")};a.globals.selection=l,"function"==typeof a.config.chart.events.selection&&a.globals.selectionEnabled&&(clearTimeout(this.w.globals.selectionResizeTimer),this.w.globals.selectionResizeTimer=window.setTimeout((function(){var t=i.gridRect.getBoundingClientRect(),e=r.node.getBoundingClientRect(),n=a.globals.xAxisScale.niceMin+(e.left-t.left)*s.xRatio,o=a.globals.xAxisScale.niceMin+(e.right-t.left)*s.xRatio,l=a.globals.yAxisScale[0].niceMin+(t.bottom-e.bottom)*s.yRatio[0],h=a.globals.yAxisScale[0].niceMax-(e.top-t.top)*s.yRatio[0];a.config.chart.events.selection(i.ctx,{xaxis:{min:n,max:o},yaxis:{min:l,max:h}});}),n));}},{key:"selectionDrawn",value:function(t){var e=t.context,i=t.zoomtype,a=this.w,s=e,r=this.xyRatios,n=this.ctx.toolbar;if(s.startX>s.endX){var o=s.startX;s.startX=s.endX,s.endX=o;}if(s.startY>s.endY){var l=s.startY;s.startY=s.endY,s.endY=l;}var h=a.globals.xAxisScale.niceMin+s.startX*r.xRatio,c=a.globals.xAxisScale.niceMin+s.endX*r.xRatio,d=[],u=[];if(a.config.yaxis.forEach((function(t,e){d.push(a.globals.yAxisScale[e].niceMax-r.yRatio[e]*s.startY),u.push(a.globals.yAxisScale[e].niceMax-r.yRatio[e]*s.endY);})),s.dragged&&(s.dragX>10||s.dragY>10)&&h!==c)if(a.globals.zoomEnabled){var f=g.clone(a.globals.initialConfig.yaxis),p=g.clone(a.globals.initialConfig.xaxis);if(a.globals.zoomed=!0,a.globals.zoomed||(a.globals.lastXAxis=g.clone(a.config.xaxis),a.globals.lastYAxis=g.clone(a.config.yaxis)),a.config.xaxis.convertedCatToNumeric&&(h=Math.floor(h),c=Math.floor(c),h<1&&(h=1,c=a.globals.dataPoints),c-h<2&&(c=h+1)),"xy"!==i&&"x"!==i||(p={min:h,max:c}),"xy"!==i&&"y"!==i||f.forEach((function(t,e){f[e].min=u[e],f[e].max=d[e];})),a.config.chart.zoom.autoScaleYaxis){var x=new j(s.ctx);f=x.autoScaleY(s.ctx,f,{xaxis:p});}if(n){var b=n.getBeforeZoomRange(p,f);b&&(p=b.xaxis?b.xaxis:p,f=b.yaxis?b.yaxe:f);}var m={xaxis:p};a.config.chart.group||(m.yaxis=f),s.ctx.updateHelpers._updateOptions(m,!1,s.w.config.chart.animations.dynamicAnimation.enabled),"function"==typeof a.config.chart.events.zoomed&&n.zoomCallback(p,f);}else if(a.globals.selectionEnabled){var v,y=null;v={min:h,max:c},"xy"!==i&&"y"!==i||(y=g.clone(a.config.yaxis)).forEach((function(t,e){y[e].min=u[e],y[e].max=d[e];})),a.globals.selection=s.selection,"function"==typeof a.config.chart.events.selection&&a.config.chart.events.selection(s.ctx,{xaxis:v,yaxis:y});}}},{key:"panDragging",value:function(t){var e=t.context,i=this.w,a=e;if(void 0!==i.globals.lastClientPosition.x){var s=i.globals.lastClientPosition.x-a.clientX,r=i.globals.lastClientPosition.y-a.clientY;Math.abs(s)>Math.abs(r)&&s>0?this.moveDirection="left":Math.abs(s)>Math.abs(r)&&s<0?this.moveDirection="right":Math.abs(r)>Math.abs(s)&&r>0?this.moveDirection="up":Math.abs(r)>Math.abs(s)&&r<0&&(this.moveDirection="down");}i.globals.lastClientPosition={x:a.clientX,y:a.clientY};var n=i.globals.minX,o=i.globals.maxX;i.config.xaxis.convertedCatToNumeric||a.panScrolled(n,o);}},{key:"delayedPanScrolled",value:function(){var t=this.w,e=t.globals.minX,i=t.globals.maxX,a=(t.globals.maxX-t.globals.minX)/2;"left"===this.moveDirection?(e=t.globals.minX+a,i=t.globals.maxX+a):"right"===this.moveDirection&&(e=t.globals.minX-a,i=t.globals.maxX-a),e=Math.floor(e),i=Math.floor(i),this.updateScrolledChart({xaxis:{min:e,max:i}},e,i);}},{key:"panScrolled",value:function(t,e){var i=this.w,a=this.xyRatios,s=g.clone(i.globals.initialConfig.yaxis);"left"===this.moveDirection?(t=i.globals.minX+i.globals.gridWidth/15*a.xRatio,e=i.globals.maxX+i.globals.gridWidth/15*a.xRatio):"right"===this.moveDirection&&(t=i.globals.minX-i.globals.gridWidth/15*a.xRatio,e=i.globals.maxX-i.globals.gridWidth/15*a.xRatio),(t<i.globals.initialMinX||e>i.globals.initialMaxX)&&(t=i.globals.minX,e=i.globals.maxX);var r={min:t,max:e};i.config.chart.zoom.autoScaleYaxis&&(s=new j(this.ctx).autoScaleY(this.ctx,s,{xaxis:r}));var n={xaxis:{min:t,max:e}};i.config.chart.group||(n.yaxis=s),this.updateScrolledChart(n,t,e);}},{key:"updateScrolledChart",value:function(t,e,i){var a=this.w;this.ctx.updateHelpers._updateOptions(t,!1,!1),"function"==typeof a.config.chart.events.scrolled&&a.config.chart.events.scrolled(this.ctx,{xaxis:{min:e,max:i}});}}]),i}(),dt=function(){function t(i){e(this,t),this.w=i.w,this.ttCtx=i,this.ctx=i.ctx;}return a(t,[{key:"getNearestValues",value:function(t){var e=t.hoverArea,i=t.elGrid,a=t.clientX,s=t.clientY,r=this.w,n=r.globals.gridWidth,o=n/(r.globals.dataPoints-1),l=i.getBoundingClientRect(),h=this.hasBars();!r.globals.comboCharts&&!h||r.config.xaxis.convertedCatToNumeric||(o=n/r.globals.dataPoints);var c=a-l.left-r.globals.barPadForNumericAxis,d=s-l.top;c<0||d<0||c>r.globals.gridWidth||d>r.globals.gridHeight?(e.classList.remove("hovering-zoom"),e.classList.remove("hovering-pan")):r.globals.zoomEnabled?(e.classList.remove("hovering-pan"),e.classList.add("hovering-zoom")):r.globals.panEnabled&&(e.classList.remove("hovering-zoom"),e.classList.add("hovering-pan"));var u=Math.round(c/o);h&&!r.config.xaxis.convertedCatToNumeric&&(u=Math.ceil(c/o),u-=1);for(var f,p=null,x=null,b=[],m=0;m<r.globals.seriesXvalues.length;m++)b.push([r.globals.seriesXvalues[m][0]-1e-6].concat(r.globals.seriesXvalues[m]));return b=b.map((function(t){return t.filter((function(t){return t}))})),f=r.globals.seriesYvalues.map((function(t){return t.filter((function(t){return g.isNumber(t)}))})),r.globals.isXNumeric&&(p=(x=this.closestInMultiArray(c,d,b,f)).index,u=x.j,null!==p&&(b=r.globals.seriesXvalues[p],u=(x=this.closestInArray(c,b)).index)),r.globals.capturedSeriesIndex=null===p?-1:p,(!u||u<1)&&(u=0),r.globals.capturedDataPointIndex=u,{capturedSeries:p,j:u,hoverX:c,hoverY:d}}},{key:"closestInMultiArray",value:function(t,e,i,a){var s=this.w,r=0,n=null,o=-1;s.globals.series.length>1?r=this.getFirstActiveXArray(i):n=0;var l=a[r][0],h=i[r][0],c=Math.abs(t-h),d=Math.abs(e-l),g=d+c;return a.map((function(s,r){s.map((function(s,l){var h=Math.abs(e-a[r][l]),u=Math.abs(t-i[r][l]),f=u+h;f<g&&(g=f,c=u,d=h,n=r,o=l);}));})),{index:n,j:o}}},{key:"getFirstActiveXArray",value:function(t){for(var e=0,i=new m(this.ctx),a=t.map((function(t,e){return t.length>0?e:-1})),s=0;s<a.length;s++){var r=i.getSeriesTotalByIndex(s);if(-1!==a[s]&&0!==r&&!i.seriesHaveSameValues(s)){e=a[s];break}}return e}},{key:"closestInArray",value:function(t,e){for(var i=e[0],a=null,s=Math.abs(t-i),r=0;r<e.length;r++){var n=Math.abs(t-e[r]);n<s&&(s=n,a=r);}return {index:a}}},{key:"isXoverlap",value:function(t){var e=[],i=this.w.globals.seriesX.filter((function(t){return void 0!==t[0]}));if(i.length>0)for(var a=0;a<i.length-1;a++)void 0!==i[a][t]&&void 0!==i[a+1][t]&&i[a][t]!==i[a+1][t]&&e.push("unEqual");return 0===e.length}},{key:"isInitialSeriesSameLen",value:function(){for(var t=!0,e=this.w.globals.initialSeries,i=0;i<e.length-1;i++)if(e[i].data.length!==e[i+1].data.length){t=!1;break}return t}},{key:"getBarsHeight",value:function(t){return d(t).reduce((function(t,e){return t+e.getBBox().height}),0)}},{key:"getElMarkers",value:function(){return this.w.globals.dom.baseEl.querySelectorAll(" .apexcharts-series-markers")}},{key:"getAllMarkers",value:function(){var t=this.w.globals.dom.baseEl.querySelectorAll(".apexcharts-series-markers-wrap");(t=d(t)).sort((function(t,e){return Number(e.getAttribute("data:realIndex"))<Number(t.getAttribute("data:realIndex"))?0:-1}));var e=[];return t.forEach((function(t){e.push(t.querySelector(".apexcharts-marker"));})),e}},{key:"hasMarkers",value:function(){return this.getElMarkers().length>0}},{key:"getElBars",value:function(){return this.w.globals.dom.baseEl.querySelectorAll(".apexcharts-bar-series,  .apexcharts-candlestick-series, .apexcharts-rangebar-series")}},{key:"hasBars",value:function(){return this.getElBars().length>0}},{key:"getHoverMarkerSize",value:function(t){var e=this.w,i=e.config.markers.hover.size;return void 0===i&&(i=e.globals.markers.size[t]+e.config.markers.hover.sizeOffset),i}},{key:"toggleAllTooltipSeriesGroups",value:function(t){var e=this.w,i=this.ttCtx;0===i.allTooltipSeriesGroups.length&&(i.allTooltipSeriesGroups=e.globals.dom.baseEl.querySelectorAll(".apexcharts-tooltip-series-group"));for(var a=i.allTooltipSeriesGroups,s=0;s<a.length;s++)"enable"===t?(a[s].classList.add("apexcharts-active"),a[s].style.display=e.config.tooltip.items.display):(a[s].classList.remove("apexcharts-active"),a[s].style.display="none");}}]),t}(),gt=function(){function t(i){e(this,t),this.w=i.w,this.ctx=i.ctx,this.ttCtx=i,this.tooltipUtil=new dt(i);}return a(t,[{key:"drawSeriesTexts",value:function(t){var e=t.shared,i=void 0===e||e,a=t.ttItems,s=t.i,r=void 0===s?0:s,n=t.j,o=void 0===n?null:n,l=t.y1,h=t.y2,c=this.w;void 0!==c.config.tooltip.custom?this.handleCustomTooltip({i:r,j:o,y1:l,y2:h,w:c}):this.toggleActiveInactiveSeries(i);var d=this.getValuesToPrint({i:r,j:o});this.printLabels({i:r,j:o,values:d,ttItems:a,shared:i});var g=this.ttCtx.getElTooltip();this.ttCtx.tooltipRect.ttWidth=g.getBoundingClientRect().width,this.ttCtx.tooltipRect.ttHeight=g.getBoundingClientRect().height;}},{key:"printLabels",value:function(t){var e,i=this,a=t.i,s=t.j,r=t.values,n=t.ttItems,o=t.shared,l=this.w,h=r.xVal,c=r.zVal,d=r.xAxisTTVal,g="",u=l.globals.colors[a];null!==s&&l.config.plotOptions.bar.distributed&&(u=l.globals.colors[s]);for(var f=function(t,r){var f=i.getFormatters(a);g=i.getSeriesName({fn:f.yLbTitleFormatter,index:a,seriesIndex:a,j:s});var p=l.config.tooltip.inverseOrder?r:t;if(l.globals.axisCharts){var x=function(t){return f.yLbFormatter(l.globals.series[t][s],{series:l.globals.series,seriesIndex:t,dataPointIndex:s,w:l})};o?(f=i.getFormatters(p),g=i.getSeriesName({fn:f.yLbTitleFormatter,index:p,seriesIndex:a,j:s}),u=l.globals.colors[p],e=x(p)):e=x(a);}null===s&&(e=f.yLbFormatter(l.globals.series[a],l)),i.DOMHandling({i:a,t:p,j:s,ttItems:n,values:{val:e,xVal:h,xAxisTTVal:d,zVal:c},seriesName:g,shared:o,pColor:u});},p=0,x=l.globals.series.length-1;p<l.globals.series.length;p++,x--)f(p,x);}},{key:"getFormatters",value:function(t){var e,i=this.w,a=i.globals.yLabelFormatters[t];return void 0!==i.globals.ttVal?Array.isArray(i.globals.ttVal)?(a=i.globals.ttVal[t]&&i.globals.ttVal[t].formatter,e=i.globals.ttVal[t]&&i.globals.ttVal[t].title&&i.globals.ttVal[t].title.formatter):(a=i.globals.ttVal.formatter,"function"==typeof i.globals.ttVal.title.formatter&&(e=i.globals.ttVal.title.formatter)):e=i.config.tooltip.y.title.formatter,"function"!=typeof a&&(a=i.globals.yLabelFormatters[0]?i.globals.yLabelFormatters[0]:function(t){return t}),"function"!=typeof e&&(e=function(t){return t}),{yLbFormatter:a,yLbTitleFormatter:e}}},{key:"getSeriesName",value:function(t){var e=t.fn,i=t.index,a=t.seriesIndex,s=t.j,r=this.w;return e(String(r.globals.seriesNames[i]),{series:r.globals.series,seriesIndex:a,dataPointIndex:s,w:r})}},{key:"DOMHandling",value:function(t){var e=t.i,i=t.t,a=(t.j,t.ttItems),s=t.values,r=t.seriesName,n=t.shared,o=t.pColor,l=this.w,h=this.ttCtx,c=s.val,d=s.xVal,g=s.xAxisTTVal,u=s.zVal,f=null;f=a[i].children,l.config.tooltip.fillSeriesColor&&(a[i].style.backgroundColor=o,f[0].style.display="none"),h.showTooltipTitle&&(null===h.tooltipTitle&&(h.tooltipTitle=l.globals.dom.baseEl.querySelector(".apexcharts-tooltip-title")),h.tooltipTitle.innerHTML=d),h.blxaxisTooltip&&(h.xaxisTooltipText.innerHTML=""!==g?g:d);var p=a[i].querySelector(".apexcharts-tooltip-text-label");p&&(p.innerHTML=r?r+": ":"");var x=a[i].querySelector(".apexcharts-tooltip-text-value");(x&&(x.innerHTML=void 0!==c?c:""),f[0]&&f[0].classList.contains("apexcharts-tooltip-marker")&&(l.config.tooltip.marker.fillColors&&Array.isArray(l.config.tooltip.marker.fillColors)&&(o=l.config.tooltip.marker.fillColors[e]),f[0].style.backgroundColor=o),l.config.tooltip.marker.show||(f[0].style.display="none"),null!==u)&&(a[i].querySelector(".apexcharts-tooltip-text-z-label").innerHTML=l.config.tooltip.z.title,a[i].querySelector(".apexcharts-tooltip-text-z-value").innerHTML=void 0!==u?u:"");n&&f[0]&&(null==c||l.globals.collapsedSeriesIndices.indexOf(i)>-1?f[0].parentNode.style.display="none":f[0].parentNode.style.display=l.config.tooltip.items.display);}},{key:"toggleActiveInactiveSeries",value:function(t){var e=this.w;if(t)this.tooltipUtil.toggleAllTooltipSeriesGroups("enable");else {this.tooltipUtil.toggleAllTooltipSeriesGroups("disable");var i=e.globals.dom.baseEl.querySelector(".apexcharts-tooltip-series-group");i&&(i.classList.add("apexcharts-active"),i.style.display=e.config.tooltip.items.display);}}},{key:"getValuesToPrint",value:function(t){var e=t.i,i=t.j,a=this.w,s=this.ctx.series.filteredSeriesX(),r="",n="",o=null,l=null,h={series:a.globals.series,seriesIndex:e,dataPointIndex:i,w:a},c=a.globals.ttZFormatter;null===i?l=a.globals.series[e]:a.globals.isXNumeric?(r=s[e][i],0===s[e].length&&(r=s[this.tooltipUtil.getFirstActiveXArray(s)][i])):r=void 0!==a.globals.labels[i]?a.globals.labels[i]:"";var d=r;a.globals.isXNumeric&&"datetime"===a.config.xaxis.type?r=new W(this.ctx).xLabelFormat(a.globals.ttKeyFormatter,d,d):a.globals.isBarHorizontal||(r=a.globals.xLabelFormatter(d,h));return void 0!==a.config.tooltip.x.formatter&&(r=a.globals.ttKeyFormatter(d,h)),a.globals.seriesZ.length>0&&a.globals.seriesZ[0].length>0&&(o=c(a.globals.seriesZ[e][i],a)),n="function"==typeof a.config.xaxis.tooltip.formatter?a.globals.xaxisTooltipFormatter(d,h):r,{val:Array.isArray(l)?l.join(" "):l,xVal:Array.isArray(r)?r.join(" "):r,xAxisTTVal:Array.isArray(n)?n.join(" "):n,zVal:o}}},{key:"handleCustomTooltip",value:function(t){var e=t.i,i=t.j,a=t.y1,s=t.y2,r=t.w,n=this.ttCtx.getElTooltip(),o=r.config.tooltip.custom;Array.isArray(o)&&o[e]&&(o=o[e]),n.innerHTML=o({ctx:this.ctx,series:r.globals.series,seriesIndex:e,dataPointIndex:i,y1:a,y2:s,w:r});}}]),t}(),ut=function(){function t(i){e(this,t),this.ttCtx=i,this.ctx=i.ctx,this.w=i.w;}return a(t,[{key:"moveXCrosshairs",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.ttCtx,a=this.w,s=i.getElXCrosshairs(),r=t-i.xcrosshairsWidth/2,n=a.globals.labels.slice().length;if(null!==e&&(r=a.globals.gridWidth/n*e),null!==s&&(s.setAttribute("x",r),s.setAttribute("x1",r),s.setAttribute("x2",r),s.setAttribute("y2",a.globals.gridHeight),s.classList.add("apexcharts-active")),r<0&&(r=0),r>a.globals.gridWidth&&(r=a.globals.gridWidth),i.blxaxisTooltip){var o=r;"tickWidth"!==a.config.xaxis.crosshairs.width&&"barWidth"!==a.config.xaxis.crosshairs.width||(o=r+i.xcrosshairsWidth/2),this.moveXAxisTooltip(o);}}},{key:"moveYCrosshairs",value:function(t){var e=this.ttCtx;null!==e.ycrosshairs&&p.setAttrs(e.ycrosshairs,{y1:t,y2:t}),null!==e.ycrosshairsHidden&&p.setAttrs(e.ycrosshairsHidden,{y1:t,y2:t});}},{key:"moveXAxisTooltip",value:function(t){var e=this.w,i=this.ttCtx;if(null!==i.xaxisTooltip){i.xaxisTooltip.classList.add("apexcharts-active");var a=i.xaxisOffY+e.config.xaxis.tooltip.offsetY+e.globals.translateY+1+e.config.xaxis.offsetY;if(t-=i.xaxisTooltip.getBoundingClientRect().width/2,!isNaN(t)){t+=e.globals.translateX;var s;s=new p(this.ctx).getTextRects(i.xaxisTooltipText.innerHTML),i.xaxisTooltipText.style.minWidth=s.width+"px",i.xaxisTooltip.style.left=t+"px",i.xaxisTooltip.style.top=a+"px";}}}},{key:"moveYAxisTooltip",value:function(t){var e=this.w,i=this.ttCtx;null===i.yaxisTTEls&&(i.yaxisTTEls=e.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxistooltip"));var a=parseInt(i.ycrosshairsHidden.getAttribute("y1"),10),s=e.globals.translateY+a,r=i.yaxisTTEls[t].getBoundingClientRect().height,n=e.globals.translateYAxisX[t]-2;e.config.yaxis[t].opposite&&(n-=26),s-=r/2,-1===e.globals.ignoreYAxisIndexes.indexOf(t)?(i.yaxisTTEls[t].classList.add("apexcharts-active"),i.yaxisTTEls[t].style.top=s+"px",i.yaxisTTEls[t].style.left=n+e.config.yaxis[t].tooltip.offsetX+"px"):i.yaxisTTEls[t].classList.remove("apexcharts-active");}},{key:"moveTooltip",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=this.w,s=this.ttCtx,r=s.getElTooltip(),n=s.tooltipRect,o=null!==i?parseFloat(i):1,l=parseFloat(t)+o+5,h=parseFloat(e)+o/2;if(l>a.globals.gridWidth/2&&(l=l-n.ttWidth-o-15),l>a.globals.gridWidth-n.ttWidth-10&&(l=a.globals.gridWidth-n.ttWidth),l<-20&&(l=-20),a.config.tooltip.followCursor){var c=s.getElGrid(),d=c.getBoundingClientRect();h=s.e.clientY+a.globals.translateY-d.top-n.ttHeight/2;}if(!a.config.tooltip.followCursor){var g=this.positionChecks(n,l,h);l=g.x,h=g.y;}isNaN(l)||(l+=a.globals.translateX,r.style.left=l+"px",r.style.top=h+"px");}},{key:"positionChecks",value:function(t,e,i){var a=this.w;return t.ttHeight/2+i>a.globals.gridHeight&&(i=a.globals.gridHeight-t.ttHeight+a.globals.translateY),i<0&&(i=0),{x:e,y:i}}},{key:"moveMarkers",value:function(t,e){var i=this.w,a=this.ttCtx;if(i.globals.markers.size[t]>0)for(var s=i.globals.dom.baseEl.querySelectorAll(" .apexcharts-series[data\\:realIndex='".concat(t,"'] .apexcharts-marker")),r=0;r<s.length;r++)parseInt(s[r].getAttribute("rel"),10)===e&&(a.marker.resetPointsSize(),a.marker.enlargeCurrentPoint(e,s[r]));else a.marker.resetPointsSize(),this.moveDynamicPointOnHover(e,t);}},{key:"moveDynamicPointOnHover",value:function(t,e){var i,a,s=this.w,r=this.ttCtx,n=s.globals.pointsArray,o=r.tooltipUtil.getHoverMarkerSize(e),l=s.config.series[e].type;if(!l||"column"!==l&&"candlestick"!==l){i=n[e][t][0],a=n[e][t][1]?n[e][t][1]:0;var h=s.globals.dom.baseEl.querySelector(".apexcharts-series[data\\:realIndex='".concat(e,"'] .apexcharts-series-markers circle"));h&&a<s.globals.gridHeight&&a>0&&(h.setAttribute("r",o),h.setAttribute("cx",i),h.setAttribute("cy",a)),this.moveXCrosshairs(i),r.fixedTooltip||this.moveTooltip(i,a,o);}}},{key:"moveDynamicPointsOnHover",value:function(t){var e,i=this.ttCtx,a=i.w,s=0,r=0,n=a.globals.pointsArray;e=new M(this.ctx).getActiveConfigSeriesIndex(!0);var o=i.tooltipUtil.getHoverMarkerSize(e);n[e]&&(s=n[e][t][0],r=n[e][t][1]);var l=i.tooltipUtil.getAllMarkers();if(null!==l)for(var h=0;h<a.globals.series.length;h++){var c=n[h];if(a.globals.comboCharts&&void 0===c&&l.splice(h,0,null),c&&c.length){var d=n[h][t][1];l[h].setAttribute("cx",s),null!==d&&!isNaN(d)&&d<a.globals.gridHeight&&d>0?(l[h]&&l[h].setAttribute("r",o),l[h]&&l[h].setAttribute("cy",d)):l[h]&&l[h].setAttribute("r",0);}}if(this.moveXCrosshairs(s),!i.fixedTooltip){var g=r||a.globals.gridHeight;this.moveTooltip(s,g,o);}}},{key:"moveStickyTooltipOverBars",value:function(t){var e,i=this.w,a=this.ttCtx,s=i.globals.columnSeries?i.globals.columnSeries.length:i.globals.series.length,r=s>=2&&s%2==0?Math.floor(s/2):Math.floor(s/2)+1,n=i.globals.dom.baseEl.querySelector(".apexcharts-bar-series .apexcharts-series[rel='".concat(r,"'] path[j='").concat(t,"'], .apexcharts-candlestick-series .apexcharts-series[rel='").concat(r,"'] path[j='").concat(t,"'], .apexcharts-rangebar-series .apexcharts-series[rel='").concat(r,"'] path[j='").concat(t,"']")),o=n?parseFloat(n.getAttribute("cx")):0,l=n?parseFloat(n.getAttribute("barWidth")):0;i.globals.isXNumeric?o-=s%2!=0?l/2:0:(o=a.xAxisTicksPositions[t-1]+a.dataPointsDividedWidth/2,isNaN(o)&&(o=a.xAxisTicksPositions[t]-a.dataPointsDividedWidth/2));var h=a.getElGrid().getBoundingClientRect();if(e=a.e.clientY-h.top-a.tooltipRect.ttHeight/2,this.moveXCrosshairs(o),!a.fixedTooltip){var c=e||i.globals.gridHeight;this.moveTooltip(o,c);}}}]),t}(),ft=function(){function t(i){e(this,t),this.w=i.w,this.ttCtx=i,this.ctx=i.ctx,this.tooltipPosition=new ut(i);}return a(t,[{key:"drawDynamicPoints",value:function(){var t=this.w,e=new p(this.ctx),i=new P(this.ctx),a=t.globals.dom.baseEl.querySelectorAll(".apexcharts-series");(a=d(a)).sort((function(t,e){return Number(e.getAttribute("data:realIndex"))<Number(t.getAttribute("data:realIndex"))?0:-1}));for(var s=0;s<a.length;s++){var r=a[s].querySelector(".apexcharts-series-markers-wrap");if(null!==r){var n=void 0,o="apexcharts-marker w".concat((Math.random()+1).toString(36).substring(4));"line"!==t.config.chart.type&&"area"!==t.config.chart.type||t.globals.comboCharts||t.config.tooltip.intersect||(o+=" no-pointer-events");var l=i.getMarkerConfig(o,s);(n=e.drawMarker(0,0,l)).node.setAttribute("default-marker-size",0);var h=document.createElementNS(t.globals.SVGNS,"g");h.classList.add("apexcharts-series-markers"),h.appendChild(n.node),r.appendChild(h);}}}},{key:"enlargeCurrentPoint",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,s=this.w;"bubble"!==s.config.chart.type&&this.newPointSize(t,e);var r=e.getAttribute("cx"),n=e.getAttribute("cy");if(null!==i&&null!==a&&(r=i,n=a),this.tooltipPosition.moveXCrosshairs(r),!this.fixedTooltip){if("radar"===s.config.chart.type){var o=this.ttCtx.getElGrid(),l=o.getBoundingClientRect();r=this.ttCtx.e.clientX-l.left;}this.tooltipPosition.moveTooltip(r,n,s.config.markers.hover.size);}}},{key:"enlargePoints",value:function(t){for(var e=this.w,i=this.ttCtx,a=t,s=e.globals.dom.baseEl.querySelectorAll(".apexcharts-series:not(.apexcharts-series-collapsed) .apexcharts-marker"),r=e.config.markers.hover.size,n=0;n<s.length;n++){var o=s[n].getAttribute("rel"),l=s[n].getAttribute("index");if(void 0===r&&(r=e.globals.markers.size[l]+e.config.markers.hover.sizeOffset),a===parseInt(o,10)){this.newPointSize(a,s[n]);var h=s[n].getAttribute("cx"),c=s[n].getAttribute("cy");this.tooltipPosition.moveXCrosshairs(h),i.fixedTooltip||this.tooltipPosition.moveTooltip(h,c,r);}else this.oldPointSize(s[n]);}}},{key:"newPointSize",value:function(t,e){var i=this.w,a=i.config.markers.hover.size,s=0===t?e.parentNode.firstChild:e.parentNode.lastChild;if("0"!==s.getAttribute("default-marker-size")){var r=parseInt(s.getAttribute("index"),10);void 0===a&&(a=i.globals.markers.size[r]+i.config.markers.hover.sizeOffset),s.setAttribute("r",a);}}},{key:"oldPointSize",value:function(t){var e=parseFloat(t.getAttribute("default-marker-size"));t.setAttribute("r",e);}},{key:"resetPointsSize",value:function(){for(var t=this.w.globals.dom.baseEl.querySelectorAll(".apexcharts-series:not(.apexcharts-series-collapsed) .apexcharts-marker"),e=0;e<t.length;e++){var i=parseFloat(t[e].getAttribute("default-marker-size"));g.isNumber(i)?t[e].setAttribute("r",i):t[e].setAttribute("r",0);}}}]),t}(),pt=function(){function t(i){e(this,t),this.w=i.w,this.ttCtx=i;}return a(t,[{key:"getAttr",value:function(t,e){return parseFloat(t.target.getAttribute(e))}},{key:"handleHeatTooltip",value:function(t){var e=t.e,i=t.opt,a=t.x,s=t.y,r=this.ttCtx,n=this.w;if(e.target.classList.contains("apexcharts-heatmap-rect")){var o=this.getAttr(e,"i"),l=this.getAttr(e,"j"),h=this.getAttr(e,"cx"),c=this.getAttr(e,"cy"),d=this.getAttr(e,"width"),g=this.getAttr(e,"height");if(r.tooltipLabels.drawSeriesTexts({ttItems:i.ttItems,i:o,j:l,shared:!1}),n.globals.capturedSeriesIndex=o,n.globals.capturedDataPointIndex=l,a=h+r.tooltipRect.ttWidth/2+d,s=c+r.tooltipRect.ttHeight/2-g/2,r.tooltipPosition.moveXCrosshairs(h+d/2),a>n.globals.gridWidth/2&&(a=h-r.tooltipRect.ttWidth/2+d),r.w.config.tooltip.followCursor){var u=r.getElGrid().getBoundingClientRect();s=r.e.clientY-u.top+n.globals.translateY/2-10;}}return {x:a,y:s}}},{key:"handleMarkerTooltip",value:function(t){var e,i,a=t.e,s=t.opt,r=t.x,n=t.y,o=this.w,l=this.ttCtx;if(a.target.classList.contains("apexcharts-marker")){var h=parseInt(s.paths.getAttribute("cx"),10),c=parseInt(s.paths.getAttribute("cy"),10),d=parseFloat(s.paths.getAttribute("val"));if(i=parseInt(s.paths.getAttribute("rel"),10),e=parseInt(s.paths.parentNode.parentNode.parentNode.getAttribute("rel"),10)-1,l.intersect){var u=g.findAncestor(s.paths,"apexcharts-series");u&&(e=parseInt(u.getAttribute("data:realIndex"),10));}if(l.tooltipLabels.drawSeriesTexts({ttItems:s.ttItems,i:e,j:i,shared:!l.showOnIntersect&&o.config.tooltip.shared}),"mouseup"===a.type&&l.markerClick(a,e,i),o.globals.capturedSeriesIndex=e,o.globals.capturedDataPointIndex=i,r=h,n=c+o.globals.translateY-1.4*l.tooltipRect.ttHeight,l.w.config.tooltip.followCursor){var f=l.getElGrid().getBoundingClientRect();n=l.e.clientY+o.globals.translateY-f.top;}d<0&&(n=c),l.marker.enlargeCurrentPoint(i,s.paths,r,n);}return {x:r,y:n}}},{key:"handleBarTooltip",value:function(t){var e,i,a=t.e,s=t.opt,r=this.w,n=this.ttCtx,o=n.getElTooltip(),l=0,h=0,c=0,d=this.getBarTooltipXY({e:a,opt:s});e=d.i;var g=d.barHeight,u=d.j;if(r.globals.capturedSeriesIndex=e,r.globals.capturedDataPointIndex=u,r.globals.isBarHorizontal&&n.tooltipUtil.hasBars()||!r.config.tooltip.shared?(h=d.x,c=d.y,i=Array.isArray(r.config.stroke.width)?r.config.stroke.width[e]:r.config.stroke.width,l=h):r.globals.comboCharts||r.config.tooltip.shared||(l/=2),isNaN(c)?c=r.globals.svgHeight-n.tooltipRect.ttHeight:c<0&&(c=0),h+n.tooltipRect.ttWidth>r.globals.gridWidth?h-=n.tooltipRect.ttWidth:h<0&&(h=0),n.w.config.tooltip.followCursor){var f=n.getElGrid().getBoundingClientRect();c=n.e.clientY-f.top;}if(null===n.tooltip&&(n.tooltip=r.globals.dom.baseEl.querySelector(".apexcharts-tooltip")),r.config.tooltip.shared||(r.globals.comboBarCount>0?n.tooltipPosition.moveXCrosshairs(l+i/2):n.tooltipPosition.moveXCrosshairs(l)),!n.fixedTooltip&&(!r.config.tooltip.shared||r.globals.isBarHorizontal&&n.tooltipUtil.hasBars())){var p=r.globals.isMultipleYAxis?r.config.yaxis[x]&&r.config.yaxis[x].reversed:r.config.yaxis[0].reversed;p&&(h-=n.tooltipRect.ttWidth)<0&&(h=0),o.style.left=h+r.globals.translateX+"px";var x=parseInt(s.paths.parentNode.getAttribute("data:realIndex"),10);!p||r.globals.isBarHorizontal&&n.tooltipUtil.hasBars()||(c=c+g-2*(r.globals.series[e][u]<0?g:0)),n.tooltipRect.ttHeight+c>r.globals.gridHeight?(c=r.globals.gridHeight-n.tooltipRect.ttHeight+r.globals.translateY,o.style.top=c+"px"):o.style.top=c+r.globals.translateY-n.tooltipRect.ttHeight/2+"px";}}},{key:"getBarTooltipXY",value:function(t){var e=t.e,i=t.opt,a=this.w,s=null,r=this.ttCtx,n=0,o=0,l=0,h=0,c=0,d=e.target.classList;if(d.contains("apexcharts-bar-area")||d.contains("apexcharts-candlestick-area")||d.contains("apexcharts-rangebar-area")){var g=e.target,u=g.getBoundingClientRect(),f=i.elGrid.getBoundingClientRect(),p=u.height;c=u.height;var x=u.width,b=parseInt(g.getAttribute("cx"),10),m=parseInt(g.getAttribute("cy"),10);h=parseFloat(g.getAttribute("barWidth"));var v="touchmove"===e.type?e.touches[0].clientX:e.clientX;s=parseInt(g.getAttribute("j"),10),n=parseInt(g.parentNode.getAttribute("rel"),10)-1;var y=g.getAttribute("data-range-y1"),w=g.getAttribute("data-range-y2");a.globals.comboCharts&&(n=parseInt(g.parentNode.getAttribute("data:realIndex"),10)),r.tooltipLabels.drawSeriesTexts({ttItems:i.ttItems,i:n,j:s,y1:y?parseInt(y,10):null,y2:w?parseInt(w,10):null,shared:!r.showOnIntersect&&a.config.tooltip.shared}),a.config.tooltip.followCursor?a.globals.isBarHorizontal?(o=v-f.left+15,l=m-r.dataPointsDividedHeight+p/2-r.tooltipRect.ttHeight/2):(o=a.globals.isXNumeric?b-x/2:b-r.dataPointsDividedWidth+x/2,l=e.clientY-f.top-r.tooltipRect.ttHeight/2-15):a.globals.isBarHorizontal?((o=b)<r.xyRatios.baseLineInvertedY&&(o=b-r.tooltipRect.ttWidth),l=m-r.dataPointsDividedHeight+p/2-r.tooltipRect.ttHeight/2):(o=a.globals.isXNumeric?b-x/2:b-r.dataPointsDividedWidth+x/2,l=m);}return {x:o,y:l,barHeight:c,barWidth:h,i:n,j:s}}}]),t}(),xt=function(){function t(i){e(this,t),this.w=i.w,this.ttCtx=i;}return a(t,[{key:"drawXaxisTooltip",value:function(){var t=this.w,e=this.ttCtx,i="bottom"===t.config.xaxis.position;e.xaxisOffY=i?t.globals.gridHeight+1:-t.globals.xAxisHeight-t.config.xaxis.axisTicks.height+3;var a=i?"apexcharts-xaxistooltip apexcharts-xaxistooltip-bottom":"apexcharts-xaxistooltip apexcharts-xaxistooltip-top",s=t.globals.dom.elWrap;e.blxaxisTooltip&&(null===t.globals.dom.baseEl.querySelector(".apexcharts-xaxistooltip")&&(e.xaxisTooltip=document.createElement("div"),e.xaxisTooltip.setAttribute("class",a+" apexcharts-theme-"+t.config.tooltip.theme),s.appendChild(e.xaxisTooltip),e.xaxisTooltipText=document.createElement("div"),e.xaxisTooltipText.classList.add("apexcharts-xaxistooltip-text"),e.xaxisTooltipText.style.fontFamily=t.config.xaxis.tooltip.style.fontFamily||t.config.chart.fontFamily,e.xaxisTooltipText.style.fontSize=t.config.xaxis.tooltip.style.fontSize,e.xaxisTooltip.appendChild(e.xaxisTooltipText)));}},{key:"drawYaxisTooltip",value:function(){for(var t=this.w,e=this.ttCtx,i=function(i){var a=t.config.yaxis[i].opposite||t.config.yaxis[i].crosshairs.opposite;e.yaxisOffX=a?t.globals.gridWidth+1:1;var s="apexcharts-yaxistooltip apexcharts-yaxistooltip-".concat(i,a?" apexcharts-yaxistooltip-right":" apexcharts-yaxistooltip-left");t.globals.yAxisSameScaleIndices.map((function(e,a){e.map((function(e,a){a===i&&(s+=t.config.yaxis[a].show?" ":" apexcharts-yaxistooltip-hidden");}));}));var r=t.globals.dom.elWrap;null===t.globals.dom.baseEl.querySelector(".apexcharts-yaxistooltip apexcharts-yaxistooltip-".concat(i))&&(e.yaxisTooltip=document.createElement("div"),e.yaxisTooltip.setAttribute("class",s+" apexcharts-theme-"+t.config.tooltip.theme),r.appendChild(e.yaxisTooltip),0===i&&(e.yaxisTooltipText=[]),e.yaxisTooltipText[i]=document.createElement("div"),e.yaxisTooltipText[i].classList.add("apexcharts-yaxistooltip-text"),e.yaxisTooltip.appendChild(e.yaxisTooltipText[i]));},a=0;a<t.config.yaxis.length;a++)i(a);}},{key:"setXCrosshairWidth",value:function(){var t=this.w,e=this.ttCtx,i=e.getElXCrosshairs();if(e.xcrosshairsWidth=parseInt(t.config.xaxis.crosshairs.width,10),t.globals.comboCharts){var a=t.globals.dom.baseEl.querySelector(".apexcharts-bar-area");if(null!==a&&"barWidth"===t.config.xaxis.crosshairs.width){var s=parseFloat(a.getAttribute("barWidth"));e.xcrosshairsWidth=s;}else if("tickWidth"===t.config.xaxis.crosshairs.width){var r=t.globals.labels.length;e.xcrosshairsWidth=t.globals.gridWidth/r;}}else if("tickWidth"===t.config.xaxis.crosshairs.width){var n=t.globals.labels.length;e.xcrosshairsWidth=t.globals.gridWidth/n;}else if("barWidth"===t.config.xaxis.crosshairs.width){var o=t.globals.dom.baseEl.querySelector(".apexcharts-bar-area");if(null!==o){var l=parseFloat(o.getAttribute("barWidth"));e.xcrosshairsWidth=l;}else e.xcrosshairsWidth=1;}t.globals.isBarHorizontal&&(e.xcrosshairsWidth=0),null!==i&&e.xcrosshairsWidth>0&&i.setAttribute("width",e.xcrosshairsWidth);}},{key:"handleYCrosshair",value:function(){var t=this.w,e=this.ttCtx;e.ycrosshairs=t.globals.dom.baseEl.querySelector(".apexcharts-ycrosshairs"),e.ycrosshairsHidden=t.globals.dom.baseEl.querySelector(".apexcharts-ycrosshairs-hidden");}},{key:"drawYaxisTooltipText",value:function(t,e,i){var a=this.ttCtx,s=this.w,r=s.globals.yLabelFormatters[t];if(a.yaxisTooltips[t]){var n=a.getElGrid().getBoundingClientRect(),o=(e-n.top)*i.yRatio[t],l=s.globals.maxYArr[t]-s.globals.minYArr[t],h=s.globals.minYArr[t]+(l-o);a.tooltipPosition.moveYCrosshairs(e-n.top),a.yaxisTooltipText[t].innerHTML=r(h),a.tooltipPosition.moveYAxisTooltip(t);}}}]),t}(),bt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;var a=this.w;this.tConfig=a.config.tooltip,this.tooltipUtil=new dt(this),this.tooltipLabels=new gt(this),this.tooltipPosition=new ut(this),this.marker=new ft(this),this.intersect=new pt(this),this.axesTooltip=new xt(this),this.showOnIntersect=this.tConfig.intersect,this.showTooltipTitle=this.tConfig.x.show,this.fixedTooltip=this.tConfig.fixed.enabled,this.xaxisTooltip=null,this.yaxisTTEls=null,this.isBarShared=!a.globals.isBarHorizontal&&this.tConfig.shared;}return a(t,[{key:"getElTooltip",value:function(t){return t||(t=this),t.w.globals.dom.baseEl.querySelector(".apexcharts-tooltip")}},{key:"getElXCrosshairs",value:function(){return this.w.globals.dom.baseEl.querySelector(".apexcharts-xcrosshairs")}},{key:"getElGrid",value:function(){return this.w.globals.dom.baseEl.querySelector(".apexcharts-grid")}},{key:"drawTooltip",value:function(t){var e=this.w;this.xyRatios=t,this.blxaxisTooltip=e.config.xaxis.tooltip.enabled&&e.globals.axisCharts,this.yaxisTooltips=e.config.yaxis.map((function(t,i){return !!(t.show&&t.tooltip.enabled&&e.globals.axisCharts)})),this.allTooltipSeriesGroups=[],e.globals.axisCharts||(this.showTooltipTitle=!1);var i=document.createElement("div");if(i.classList.add("apexcharts-tooltip"),i.classList.add("apexcharts-theme-".concat(this.tConfig.theme)),e.globals.dom.elWrap.appendChild(i),e.globals.axisCharts){this.axesTooltip.drawXaxisTooltip(),this.axesTooltip.drawYaxisTooltip(),this.axesTooltip.setXCrosshairWidth(),this.axesTooltip.handleYCrosshair();var a=new G(this.ctx);this.xAxisTicksPositions=a.getXAxisTicksPositions();}if(!e.globals.comboCharts&&!this.tConfig.intersect&&"bar"!==e.config.chart.type&&"rangeBar"!==e.config.chart.type||this.tConfig.shared||(this.showOnIntersect=!0),0!==e.config.markers.size&&0!==e.globals.markers.largestSize||this.marker.drawDynamicPoints(this),e.globals.collapsedSeries.length!==e.globals.series.length){this.dataPointsDividedHeight=e.globals.gridHeight/e.globals.dataPoints,this.dataPointsDividedWidth=e.globals.gridWidth/e.globals.dataPoints,this.showTooltipTitle&&(this.tooltipTitle=document.createElement("div"),this.tooltipTitle.classList.add("apexcharts-tooltip-title"),this.tooltipTitle.style.fontFamily=this.tConfig.style.fontFamily||e.config.chart.fontFamily,this.tooltipTitle.style.fontSize=this.tConfig.style.fontSize,i.appendChild(this.tooltipTitle));var s=e.globals.series.length;(e.globals.xyCharts||e.globals.comboCharts)&&this.tConfig.shared&&(s=this.showOnIntersect?1:e.globals.series.length),this.legendLabels=e.globals.dom.baseEl.querySelectorAll(".apexcharts-legend-text"),this.ttItems=this.createTTElements(s),this.addSVGEvents();}}},{key:"createTTElements",value:function(t){for(var e=this.w,i=[],a=this.getElTooltip(),s=0;s<t;s++){var r=document.createElement("div");r.classList.add("apexcharts-tooltip-series-group"),this.tConfig.shared&&this.tConfig.enabledOnSeries&&Array.isArray(this.tConfig.enabledOnSeries)&&this.tConfig.enabledOnSeries.indexOf(s)<0&&r.classList.add("apexcharts-tooltip-series-group-hidden");var n=document.createElement("span");n.classList.add("apexcharts-tooltip-marker"),n.style.backgroundColor=e.globals.colors[s],r.appendChild(n);var o=document.createElement("div");o.classList.add("apexcharts-tooltip-text"),o.style.fontFamily=this.tConfig.style.fontFamily||e.config.chart.fontFamily,o.style.fontSize=this.tConfig.style.fontSize;var l=document.createElement("div");l.classList.add("apexcharts-tooltip-y-group");var h=document.createElement("span");h.classList.add("apexcharts-tooltip-text-label"),l.appendChild(h);var c=document.createElement("span");c.classList.add("apexcharts-tooltip-text-value"),l.appendChild(c);var d=document.createElement("div");d.classList.add("apexcharts-tooltip-z-group");var g=document.createElement("span");g.classList.add("apexcharts-tooltip-text-z-label"),d.appendChild(g);var u=document.createElement("span");u.classList.add("apexcharts-tooltip-text-z-value"),d.appendChild(u),o.appendChild(l),o.appendChild(d),r.appendChild(o),a.appendChild(r),i.push(r);}return i}},{key:"addSVGEvents",value:function(){var t=this.w,e=t.config.chart.type,i=this.getElTooltip(),a=!("bar"!==e&&"candlestick"!==e&&"rangeBar"!==e),s="area"===e||"line"===e||"scatter"===e||"bubble"===e||"radar"===e,r=t.globals.dom.Paper.node,n=this.getElGrid();n&&(this.seriesBound=n.getBoundingClientRect());var o,l=[],h=[],c={hoverArea:r,elGrid:n,tooltipEl:i,tooltipY:l,tooltipX:h,ttItems:this.ttItems};if(t.globals.axisCharts&&(s?o=t.globals.dom.baseEl.querySelectorAll(".apexcharts-series[data\\:longestSeries='true'] .apexcharts-marker"):a?o=t.globals.dom.baseEl.querySelectorAll(".apexcharts-series .apexcharts-bar-area, .apexcharts-series .apexcharts-candlestick-area, .apexcharts-series .apexcharts-rangebar-area"):"heatmap"===e&&(o=t.globals.dom.baseEl.querySelectorAll(".apexcharts-series .apexcharts-heatmap")),o&&o.length))for(var d=0;d<o.length;d++)l.push(o[d].getAttribute("cy")),h.push(o[d].getAttribute("cx"));if(t.globals.xyCharts&&!this.showOnIntersect||t.globals.comboCharts&&!this.showOnIntersect||a&&this.tooltipUtil.hasBars()&&this.tConfig.shared)this.addPathsEventListeners([r],c);else if(a&&!t.globals.comboCharts||s&&this.showOnIntersect)this.addDatapointEventsListeners(c);else if(!t.globals.axisCharts||"heatmap"===e){var g=t.globals.dom.baseEl.querySelectorAll(".apexcharts-series");this.addPathsEventListeners(g,c);}if(this.showOnIntersect){var u=t.globals.dom.baseEl.querySelectorAll(".apexcharts-line-series .apexcharts-marker, .apexcharts-area-series .apexcharts-marker");u.length>0&&this.addPathsEventListeners(u,c),this.tooltipUtil.hasBars()&&!this.tConfig.shared&&this.addDatapointEventsListeners(c);}}},{key:"drawFixedTooltipRect",value:function(){var t=this.w,e=this.getElTooltip(),i=e.getBoundingClientRect(),a=i.width+10,s=i.height+10,r=this.tConfig.fixed.offsetX,n=this.tConfig.fixed.offsetY,o=this.tConfig.fixed.position.toLowerCase();return o.indexOf("right")>-1&&(r=r+t.globals.svgWidth-a+10),o.indexOf("bottom")>-1&&(n=n+t.globals.svgHeight-s-10),e.style.left=r+"px",e.style.top=n+"px",{x:r,y:n,ttWidth:a,ttHeight:s}}},{key:"addDatapointEventsListeners",value:function(t){var e=this.w.globals.dom.baseEl.querySelectorAll(".apexcharts-series-markers .apexcharts-marker, .apexcharts-bar-area, .apexcharts-candlestick-area, .apexcharts-rangebar-area");this.addPathsEventListeners(e,t);}},{key:"addPathsEventListeners",value:function(t,e){for(var i=this,a=function(a){var s={paths:t[a],tooltipEl:e.tooltipEl,tooltipY:e.tooltipY,tooltipX:e.tooltipX,elGrid:e.elGrid,hoverArea:e.hoverArea,ttItems:e.ttItems};["mousemove","mouseup","touchmove","mouseout","touchend"].map((function(e){return t[a].addEventListener(e,i.seriesHover.bind(i,s),{capture:!1,passive:!0})}));},s=0;s<t.length;s++)a(s);}},{key:"seriesHover",value:function(t,e){var i=this,a=[],s=this.w;s.config.chart.group&&(a=this.ctx.getGroupedCharts()),s.globals.axisCharts&&(s.globals.minX===-1/0&&s.globals.maxX===1/0||0===s.globals.dataPoints)||(a.length?a.forEach((function(a){var s=i.getElTooltip(a),r={paths:t.paths,tooltipEl:s,tooltipY:t.tooltipY,tooltipX:t.tooltipX,elGrid:t.elGrid,hoverArea:t.hoverArea,ttItems:a.w.globals.tooltip.ttItems};a.w.globals.minX===i.w.globals.minX&&a.w.globals.maxX===i.w.globals.maxX&&a.w.globals.tooltip.seriesHoverByContext({chartCtx:a,ttCtx:a.w.globals.tooltip,opt:r,e:e});})):this.seriesHoverByContext({chartCtx:this.ctx,ttCtx:this.w.globals.tooltip,opt:t,e:e}));}},{key:"seriesHoverByContext",value:function(t){var e=t.chartCtx,i=t.ttCtx,a=t.opt,s=t.e,r=e.w,n=this.getElTooltip();(i.tooltipRect={x:0,y:0,ttWidth:n.getBoundingClientRect().width,ttHeight:n.getBoundingClientRect().height},i.e=s,!i.tooltipUtil.hasBars()||r.globals.comboCharts||i.isBarShared)||this.tConfig.onDatasetHover.highlightDataSeries&&new M(e).toggleSeriesOnHover(s,s.target.parentNode);i.fixedTooltip&&i.drawFixedTooltipRect(),r.globals.axisCharts?i.axisChartsTooltips({e:s,opt:a,tooltipRect:i.tooltipRect}):i.nonAxisChartsTooltips({e:s,opt:a,tooltipRect:i.tooltipRect});}},{key:"axisChartsTooltips",value:function(t){var e,i,a=t.e,s=t.opt,r=this.w,n=s.elGrid.getBoundingClientRect(),o="touchmove"===a.type?a.touches[0].clientX:a.clientX,l="touchmove"===a.type?a.touches[0].clientY:a.clientY;if(this.clientY=l,this.clientX=o,r.globals.capturedSeriesIndex=-1,r.globals.capturedDataPointIndex=-1,l<n.top||l>n.top+n.height)this.handleMouseOut(s);else {if(Array.isArray(this.tConfig.enabledOnSeries)&&!r.config.tooltip.shared){var h=parseInt(s.paths.getAttribute("index"),10);if(this.tConfig.enabledOnSeries.indexOf(h)<0)return void this.handleMouseOut(s)}var c=this.getElTooltip(),d=this.getElXCrosshairs(),g=r.globals.xyCharts||"bar"===r.config.chart.type&&!r.globals.isBarHorizontal&&this.tooltipUtil.hasBars()&&this.tConfig.shared||r.globals.comboCharts&&this.tooltipUtil.hasBars();if(r.globals.isBarHorizontal&&this.tooltipUtil.hasBars()&&(g=!1),"mousemove"===a.type||"touchmove"===a.type||"mouseup"===a.type){null!==d&&d.classList.add("apexcharts-active");var u=this.yaxisTooltips.filter((function(t){return !0===t}));if(null!==this.ycrosshairs&&u.length&&this.ycrosshairs.classList.add("apexcharts-active"),g&&!this.showOnIntersect)this.handleStickyTooltip(a,o,l,s);else if("heatmap"===r.config.chart.type){var f=this.intersect.handleHeatTooltip({e:a,opt:s,x:e,y:i});e=f.x,i=f.y,c.style.left=e+"px",c.style.top=i+"px";}else this.tooltipUtil.hasBars()&&this.intersect.handleBarTooltip({e:a,opt:s}),this.tooltipUtil.hasMarkers()&&this.intersect.handleMarkerTooltip({e:a,opt:s,x:e,y:i});if(this.yaxisTooltips.length)for(var p=0;p<r.config.yaxis.length;p++)this.axesTooltip.drawYaxisTooltipText(p,l,this.xyRatios);s.tooltipEl.classList.add("apexcharts-active");}else "mouseout"!==a.type&&"touchend"!==a.type||this.handleMouseOut(s);}}},{key:"nonAxisChartsTooltips",value:function(t){var e=t.e,i=t.opt,a=t.tooltipRect,s=this.w,r=i.paths.getAttribute("rel"),n=this.getElTooltip(),o=s.globals.dom.elWrap.getBoundingClientRect();if("mousemove"===e.type||"touchmove"===e.type){n.classList.add("apexcharts-active"),this.tooltipLabels.drawSeriesTexts({ttItems:i.ttItems,i:parseInt(r,10)-1,shared:!1});var l=s.globals.clientX-o.left-a.ttWidth/2,h=s.globals.clientY-o.top-a.ttHeight-10;n.style.left=l+"px",n.style.top=h+"px";}else "mouseout"!==e.type&&"touchend"!==e.type||n.classList.remove("apexcharts-active");}},{key:"handleStickyTooltip",value:function(t,e,i,a){var s=this.w,r=this.tooltipUtil.getNearestValues({context:this,hoverArea:a.hoverArea,elGrid:a.elGrid,clientX:e,clientY:i}),n=r.j,o=r.capturedSeries;r.hoverX<0||r.hoverX>s.globals.gridWidth?this.handleMouseOut(a):null!==o?this.handleStickyCapturedSeries(t,o,a,n):this.tooltipUtil.isXoverlap(n)&&this.create(t,this,0,n,a.ttItems);}},{key:"handleStickyCapturedSeries",value:function(t,e,i,a){var s=this.w;null===s.globals.series[e][a]?this.handleMouseOut(i):void 0!==s.globals.series[e][a]?this.tConfig.shared&&this.tooltipUtil.isXoverlap(a)&&this.tooltipUtil.isInitialSeriesSameLen()?this.create(t,this,e,a,i.ttItems):this.create(t,this,e,a,i.ttItems,!1):this.tooltipUtil.isXoverlap(a)&&this.create(t,this,0,a,i.ttItems);}},{key:"deactivateHoverFilter",value:function(){for(var t=this.w,e=new p(this.ctx),i=t.globals.dom.Paper.select(".apexcharts-bar-area"),a=0;a<i.length;a++)e.pathMouseLeave(i[a]);}},{key:"handleMouseOut",value:function(t){var e=this.w,i=this.getElXCrosshairs();if(t.tooltipEl.classList.remove("apexcharts-active"),this.deactivateHoverFilter(),"bubble"!==e.config.chart.type&&this.marker.resetPointsSize(),null!==i&&i.classList.remove("apexcharts-active"),null!==this.ycrosshairs&&this.ycrosshairs.classList.remove("apexcharts-active"),this.blxaxisTooltip&&this.xaxisTooltip.classList.remove("apexcharts-active"),this.yaxisTooltips.length){null===this.yaxisTTEls&&(this.yaxisTTEls=e.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxistooltip"));for(var a=0;a<this.yaxisTTEls.length;a++)this.yaxisTTEls[a].classList.remove("apexcharts-active");}e.config.legend.tooltipHoverFormatter&&this.legendLabels.forEach((function(t){var e=t.getAttribute("data:default-text");t.innerHTML=decodeURIComponent(e);}));}},{key:"markerClick",value:function(t,e,i){var a=this.w;"function"==typeof a.config.chart.events.markerClick&&a.config.chart.events.markerClick(t,this.ctx,{seriesIndex:e,dataPointIndex:i,w:a}),this.ctx.events.fireEvent("markerClick",[t,this.ctx,{seriesIndex:e,dataPointIndex:i,w:a}]);}},{key:"create",value:function(t,e,i,a,s){var r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,n=this.w,o=e;"mouseup"===t.type&&this.markerClick(t,i,a),null===r&&(r=this.tConfig.shared);var l=this.tooltipUtil.hasMarkers(),h=this.tooltipUtil.getElBars();if(n.config.legend.tooltipHoverFormatter){var c=n.config.legend.tooltipHoverFormatter,d=Array.from(this.legendLabels);d.forEach((function(t){var e=t.getAttribute("data:default-text");t.innerHTML=decodeURIComponent(e);}));for(var g=0;g<d.length;g++){var u=d[g],f=parseInt(u.getAttribute("i"),10),x=decodeURIComponent(u.getAttribute("data:default-text")),b=c(x,{seriesIndex:r?f:i,dataPointIndex:a,w:n});if(r)u.innerHTML=n.globals.collapsedSeriesIndices.indexOf(f)<0?b:x;else if(u.innerHTML=f===i?b:x,i===f)break}}if(r){if(o.tooltipLabels.drawSeriesTexts({ttItems:s,i:i,j:a,shared:!this.showOnIntersect&&this.tConfig.shared}),l&&(n.globals.markers.largestSize>0?o.marker.enlargePoints(a):o.tooltipPosition.moveDynamicPointsOnHover(a)),this.tooltipUtil.hasBars()&&(this.barSeriesHeight=this.tooltipUtil.getBarsHeight(h),this.barSeriesHeight>0)){var m=new p(this.ctx),v=n.globals.dom.Paper.select(".apexcharts-bar-area[j='".concat(a,"']"));this.deactivateHoverFilter(),this.tooltipPosition.moveStickyTooltipOverBars(a);for(var y=0;y<v.length;y++)m.pathMouseEnter(v[y]);}}else o.tooltipLabels.drawSeriesTexts({shared:!1,ttItems:s,i:i,j:a}),this.tooltipUtil.hasBars()&&o.tooltipPosition.moveStickyTooltipOverBars(a),l&&o.tooltipPosition.moveMarkers(i,a);}}]),t}(),mt=function(t){function i(){return e(this,i),c(this,l(i).apply(this,arguments))}return o(i,X),a(i,[{key:"draw",value:function(t,e){var i=this,a=this.w;this.graphics=new p(this.ctx),this.bar=new X(this.ctx,this.xyRatios);var s=new m(this.ctx,a);t=s.getLogSeries(t),this.yRatio=s.getLogYRatios(this.yRatio),this.barHelpers.initVariables(t),"100%"===a.config.chart.stackType&&(t=a.globals.seriesPercent.slice()),this.series=t,this.totalItems=0,this.prevY=[],this.prevX=[],this.prevYF=[],this.prevXF=[],this.prevYVal=[],this.prevXVal=[],this.xArrj=[],this.xArrjF=[],this.xArrjVal=[],this.yArrj=[],this.yArrjF=[],this.yArrjVal=[];for(var r=0;r<t.length;r++)t[r].length>0&&(this.totalItems+=t[r].length);for(var o=this.graphics.group({class:"apexcharts-bar-series apexcharts-plot-series"}),l=0,h=0,c=function(s,r){var c=void 0,d=void 0,u=void 0,f=void 0,p=[],x=[],b=a.globals.comboCharts?e[s]:s;i.yRatio.length>1&&(i.yaxisIndex=b),i.isReversed=a.config.yaxis[i.yaxisIndex]&&a.config.yaxis[i.yaxisIndex].reversed;var m=i.graphics.group({class:"apexcharts-series",seriesName:g.escapeString(a.globals.seriesNames[b]),rel:s+1,"data:realIndex":b});i.ctx.series.addCollapsedClassToSeries(m,b);var v=i.graphics.group({class:"apexcharts-datalabels","data:realIndex":b}),y=0,w=0,k=i.initialPositions(l,h,c,d,u,f);h=k.y,y=k.barHeight,d=k.yDivision,f=k.zeroW,l=k.x,w=k.barWidth,c=k.xDivision,u=k.zeroH,i.yArrj=[],i.yArrjF=[],i.yArrjVal=[],i.xArrj=[],i.xArrjF=[],i.xArrjVal=[],1===i.prevY.length&&i.prevY[0].every((function(t){return isNaN(t)}))&&(i.prevY[0]=i.prevY[0].map((function(t){return u})),i.prevYF[0]=i.prevYF[0].map((function(t){return 0})));for(var A=0;A<a.globals.dataPoints;A++){var S=i.barHelpers.getStrokeWidth(s,A,b),C={indexes:{i:s,j:A,realIndex:b,bc:r},strokeWidth:S,x:l,y:h,elSeries:m},L=null;i.isHorizontal?(L=i.drawStackedBarPaths(n({},C,{zeroW:f,barHeight:y,yDivision:d})),w=i.series[s][A]/i.invertedYRatio):(L=i.drawStackedColumnPaths(n({},C,{xDivision:c,barWidth:w,zeroH:u})),y=i.series[s][A]/i.yRatio[i.yaxisIndex]),h=L.y,l=L.x,p.push(l),x.push(h);var P=i.barHelpers.getPathFillColor(t,s,A,b);m=i.renderSeries({realIndex:b,pathFill:P,j:A,i:s,pathFrom:L.pathFrom,pathTo:L.pathTo,strokeWidth:S,elSeries:m,x:l,y:h,series:t,barHeight:y,barWidth:w,elDataLabelsWrap:v,type:"bar",visibleSeries:0});}a.globals.seriesXvalues[b]=p,a.globals.seriesYvalues[b]=x,i.prevY.push(i.yArrj),i.prevYF.push(i.yArrjF),i.prevYVal.push(i.yArrjVal),i.prevX.push(i.xArrj),i.prevXF.push(i.xArrjF),i.prevXVal.push(i.xArrjVal),o.add(m);},d=0,u=0;d<t.length;d++,u++)c(d,u);return o}},{key:"initialPositions",value:function(t,e,i,a,s,r){var n,o,l=this.w;return this.isHorizontal?(n=(n=a=l.globals.gridHeight/l.globals.dataPoints)*parseInt(l.config.plotOptions.bar.barHeight,10)/100,r=this.baseLineInvertedY+l.globals.padHorizontal+(this.isReversed?l.globals.gridWidth:0)-(this.isReversed?2*this.baseLineInvertedY:0),e=(a-n)/2):(o=i=l.globals.gridWidth/l.globals.dataPoints,o=l.globals.isXNumeric&&l.globals.dataPoints>1?(i=l.globals.minXDiff/this.xRatio)*parseInt(this.barOptions.columnWidth,10)/100:o*parseInt(l.config.plotOptions.bar.columnWidth,10)/100,s=this.baseLineY[this.yaxisIndex]+(this.isReversed?l.globals.gridHeight:0)-(this.isReversed?2*this.baseLineY[this.yaxisIndex]:0),t=l.globals.padHorizontal+(i-o)/2),{x:t,y:e,yDivision:a,xDivision:i,barHeight:n,barWidth:o,zeroH:s,zeroW:r}}},{key:"drawStackedBarPaths",value:function(t){for(var e,i=t.indexes,a=t.barHeight,s=t.strokeWidth,r=t.zeroW,n=t.x,o=t.y,l=t.yDivision,h=t.elSeries,c=this.w,d=o,g=i.i,u=i.j,f=i.bc,p=0,x=0;x<this.prevXF.length;x++)p+=this.prevXF[x][u];if(g>0){var b=r;this.prevXVal[g-1][u]<0?b=this.series[g][u]>=0?this.prevX[g-1][u]+p-2*(this.isReversed?p:0):this.prevX[g-1][u]:this.prevXVal[g-1][u]>=0&&(b=this.series[g][u]>=0?this.prevX[g-1][u]:this.prevX[g-1][u]-p+2*(this.isReversed?p:0)),e=b;}else e=r;n=null===this.series[g][u]?e:e+this.series[g][u]/this.invertedYRatio-2*(this.isReversed?this.series[g][u]/this.invertedYRatio:0),this.xArrj.push(n),this.xArrjF.push(Math.abs(e-n)),this.xArrjVal.push(this.series[g][u]);var m=this.barHelpers.getBarpaths({barYPosition:d,barHeight:a,x1:e,x2:n,strokeWidth:s,series:this.series,realIndex:i.realIndex,i:g,j:u,w:c});return this.barHelpers.barBackground({bc:f,i:g,y1:d,y2:a,elSeries:h}),o+=l,{pathTo:m.pathTo,pathFrom:m.pathFrom,x:n,y:o}}},{key:"drawStackedColumnPaths",value:function(t){var e=t.indexes,i=t.x,a=t.y,s=t.xDivision,r=t.barWidth,n=t.zeroH,o=(t.strokeWidth,t.elSeries),l=this.w,h=e.i,c=e.j,d=e.bc;if(l.globals.isXNumeric){var g=l.globals.seriesX[h][c];g||(g=0),i=(g-l.globals.minX)/this.xRatio-r/2;}for(var u,f=i,p=0,x=0;x<this.prevYF.length;x++)p+=isNaN(this.prevYF[x][c])?0:this.prevYF[x][c];if(h>0&&!l.globals.isXNumeric||h>0&&l.globals.isXNumeric&&l.globals.seriesX[h-1][c]===l.globals.seriesX[h][c]){var b,m,v=Math.min(this.yRatio.length+1,h+1);if(void 0!==this.prevY[h-1])for(var y=1;y<v;y++)if(!isNaN(this.prevY[h-y][c])){m=this.prevY[h-y][c];break}for(var w=1;w<v;w++){if(this.prevYVal[h-w][c]<0){b=this.series[h][c]>=0?m-p+2*(this.isReversed?p:0):m;break}if(this.prevYVal[h-w][c]>=0){b=this.series[h][c]>=0?m:m+p-2*(this.isReversed?p:0);break}}void 0===b&&(b=l.globals.gridHeight),u=this.prevYF[0].every((function(t){return 0===t}))&&this.prevYF.slice(1,h).every((function(t){return t.every((function(t){return isNaN(t)}))}))?l.globals.gridHeight-n:b;}else u=l.globals.gridHeight-n;a=u-this.series[h][c]/this.yRatio[this.yaxisIndex]+2*(this.isReversed?this.series[h][c]/this.yRatio[this.yaxisIndex]:0),this.yArrj.push(a),this.yArrjF.push(Math.abs(u-a)),this.yArrjVal.push(this.series[h][c]);var k=this.barHelpers.getColumnPaths({barXPosition:f,barWidth:r,y1:u,y2:a,yRatio:this.yRatio[this.yaxisIndex],strokeWidth:this.strokeWidth,series:this.series,realIndex:e.realIndex,i:h,j:c,w:l});return this.barHelpers.barBackground({bc:d,i:h,x1:f,x2:r,elSeries:o}),i+=s,{pathTo:k.pathTo,pathFrom:k.pathFrom,x:l.globals.isXNumeric?i-s:i,y:a}}}]),i}(),vt=function(t){function i(){return e(this,i),c(this,l(i).apply(this,arguments))}return o(i,X),a(i,[{key:"draw",value:function(t,e){var i=this.w,a=new p(this.ctx),s=new L(this.ctx);this.candlestickOptions=this.w.config.plotOptions.candlestick;var r=new m(this.ctx,i);t=r.getLogSeries(t),this.series=t,this.yRatio=r.getLogYRatios(this.yRatio),this.barHelpers.initVariables(t);for(var n=a.group({class:"apexcharts-candlestick-series apexcharts-plot-series"}),o=0;o<t.length;o++){var l,h,c=void 0,d=void 0,u=[],f=[],x=i.globals.comboCharts?e[o]:o,b=a.group({class:"apexcharts-series",seriesName:g.escapeString(i.globals.seriesNames[x]),rel:o+1,"data:realIndex":x});t[o].length>0&&(this.visibleI=this.visibleI+1);var v,y;this.yRatio.length>1&&(this.yaxisIndex=x);var w=this.barHelpers.initialPositions();d=w.y,v=w.barHeight,c=w.x,y=w.barWidth,l=w.xDivision,h=w.zeroH,f.push(c+y/2);for(var k=a.group({class:"apexcharts-datalabels","data:realIndex":x}),A=0;A<i.globals.dataPoints;A++){var S,C=this.barHelpers.getStrokeWidth(o,A,x),P=this.drawCandleStickPaths({indexes:{i:o,j:A,realIndex:x},x:c,y:d,xDivision:l,barWidth:y,zeroH:h,strokeWidth:C,elSeries:b});d=P.y,c=P.x,S=P.color,A>0&&f.push(c+y/2),u.push(d);var T=s.fillPath({seriesNumber:x,dataPointIndex:A,color:S,value:t[o][A]}),z=this.candlestickOptions.wick.useFillColor?S:void 0;this.renderSeries({realIndex:x,pathFill:T,lineFill:z,j:A,i:o,pathFrom:P.pathFrom,pathTo:P.pathTo,strokeWidth:C,elSeries:b,x:c,y:d,series:t,barHeight:v,barWidth:y,elDataLabelsWrap:k,visibleSeries:this.visibleI,type:"candlestick"});}i.globals.seriesXvalues[x]=f,i.globals.seriesYvalues[x]=u,n.add(b);}return n}},{key:"drawCandleStickPaths",value:function(t){var e=t.indexes,i=t.x,a=(t.y,t.xDivision),s=t.barWidth,r=t.zeroH,n=t.strokeWidth,o=this.w,l=new p(this.ctx),h=e.i,c=e.j,d=!0,g=o.config.plotOptions.candlestick.colors.upward,u=o.config.plotOptions.candlestick.colors.downward,f=this.yRatio[this.yaxisIndex],x=e.realIndex,b=this.getOHLCValue(x,c),m=r,v=r;b.o>b.c&&(d=!1);var y=Math.min(b.o,b.c),w=Math.max(b.o,b.c);o.globals.isXNumeric&&(i=(o.globals.seriesX[x][c]-o.globals.minX)/this.xRatio-s/2);var k=i+s*this.visibleI;void 0===this.series[h][c]||null===this.series[h][c]?y=r:(y=r-y/f,w=r-w/f,m=r-b.h/f,v=r-b.l/f);var A=l.move(k,r),S=l.move(k,y);return o.globals.previousPaths.length>0&&(S=this.getPreviousPath(x,c,!0)),A=l.move(k,w)+l.line(k+s/2,w)+l.line(k+s/2,m)+l.line(k+s/2,w)+l.line(k+s,w)+l.line(k+s,y)+l.line(k+s/2,y)+l.line(k+s/2,v)+l.line(k+s/2,y)+l.line(k,y)+l.line(k,w-n/2),S+=l.move(k,y),o.globals.isXNumeric||(i+=a),{pathTo:A,pathFrom:S,x:i,y:w,barXPosition:k,color:d?g:u}}},{key:"getOHLCValue",value:function(t,e){var i=this.w;return {o:i.globals.seriesCandleO[t][e],h:i.globals.seriesCandleH[t][e],l:i.globals.seriesCandleL[t][e],c:i.globals.seriesCandleC[t][e]}}}]),i}(),yt=function(){function t(i,a){e(this,t),this.ctx=i,this.w=i.w,this.xRatio=a.xRatio,this.yRatio=a.yRatio,this.negRange=!1,this.dynamicAnim=this.w.config.chart.animations.dynamicAnimation,this.rectRadius=this.w.config.plotOptions.heatmap.radius,this.strokeWidth=this.w.config.stroke.show?this.w.config.stroke.width:0;}return a(t,[{key:"draw",value:function(t){var e=this.w,i=new p(this.ctx),a=i.group({class:"apexcharts-heatmap"});a.attr("clip-path","url(#gridRectMask".concat(e.globals.cuid,")"));var s=e.globals.gridWidth/e.globals.dataPoints,r=e.globals.gridHeight/e.globals.series.length,n=0,o=!1;this.checkColorRange();var l=t.slice();e.config.yaxis[0].reversed&&(o=!0,l.reverse());for(var h=o?0:l.length-1;o?h<l.length:h>=0;o?h++:h--){var c=i.group({class:"apexcharts-series apexcharts-heatmap-series",seriesName:g.escapeString(e.globals.seriesNames[h]),rel:h+1,"data:realIndex":h});if(this.ctx.series.addCollapsedClassToSeries(c,h),e.config.chart.dropShadow.enabled){var d=e.config.chart.dropShadow;new u(this.ctx).dropShadow(c,d,h);}for(var f=0,x=0;x<l[h].length;x++){var b=1,m=e.config.plotOptions.heatmap.shadeIntensity,v=this.determineHeatColor(h,x);b=e.globals.hasNegs||this.negRange?e.config.plotOptions.heatmap.reverseNegativeShade?v.percent<0?v.percent/100*(1.25*m):(1-v.percent/100)*(1.25*m):v.percent<=0?1-(1+v.percent/100)*m:(1-v.percent/100)*m:1-v.percent/100;var y=v.color,w=new g;if(e.config.plotOptions.heatmap.enableShades&&(b<0&&(b=0),y=g.hexToRgba(w.shadeColor(b,v.color),e.config.fill.opacity)),"image"===e.config.fill.type)y=new L(this.ctx).fillPath({seriesNumber:h,dataPointIndex:x,opacity:e.globals.hasNegs?v.percent<0?1-(1+v.percent/100):m+v.percent/100:v.percent/100,patternID:g.randomId(),width:e.config.fill.image.width?e.config.fill.image.width:s,height:e.config.fill.image.height?e.config.fill.image.height:r});var k=this.rectRadius,A=i.drawRect(f,n,s,r,k);if(A.attr({cx:f,cy:n}),A.node.classList.add("apexcharts-heatmap-rect"),c.add(A),A.attr({fill:y,i:h,index:h,j:x,val:l[h][x],"stroke-width":this.strokeWidth,stroke:e.config.plotOptions.heatmap.useFillColorAsStroke?y:e.globals.stroke.colors[0],color:y}),A.node.addEventListener("mouseenter",i.pathMouseEnter.bind(this,A)),A.node.addEventListener("mouseleave",i.pathMouseLeave.bind(this,A)),A.node.addEventListener("mousedown",i.pathMouseDown.bind(this,A)),e.config.chart.animations.enabled&&!e.globals.dataChanged){var S=1;e.globals.resized||(S=e.config.chart.animations.speed),this.animateHeatMap(A,f,n,s,r,S);}if(e.globals.dataChanged){var C=1;if(this.dynamicAnim.enabled&&e.globals.shouldAnimate){C=this.dynamicAnim.speed;var P=e.globals.previousPaths[h]&&e.globals.previousPaths[h][x]&&e.globals.previousPaths[h][x].color;P||(P="rgba(255, 255, 255, 0)"),this.animateHeatColor(A,g.isColorHex(P)?P:g.rgb2hex(P),g.isColorHex(y)?y:g.rgb2hex(y),C);}}var T=this.calculateHeatmapDataLabels({x:f,y:n,i:h,j:x,heatColorProps:v,series:l,rectHeight:r,rectWidth:s});null!==T&&c.add(T),f+=s;}n+=r,a.add(c);}var z=e.globals.yAxisScale[0].result.slice();e.config.yaxis[0].reversed?z.unshift(""):z.push(""),e.globals.yAxisScale[0].result=z;var I=e.globals.gridHeight/e.globals.series.length;return e.config.yaxis[0].labels.offsetY=-I/2,a}},{key:"checkColorRange",value:function(){var t=this,e=this.w.config.plotOptions.heatmap;e.colorScale.ranges.length>0&&e.colorScale.ranges.map((function(e,i){e.from<=0&&(t.negRange=!0);}));}},{key:"determineHeatColor",value:function(t,e){var i=this.w,a=i.globals.series[t][e],s=i.config.plotOptions.heatmap,r=s.colorScale.inverse?e:t,n=i.globals.colors[r],o=null,l=Math.min.apply(Math,d(i.globals.series[t])),h=Math.max.apply(Math,d(i.globals.series[t]));s.distributed||(l=i.globals.minY,h=i.globals.maxY),void 0!==s.colorScale.min&&(l=s.colorScale.min<i.globals.minY?s.colorScale.min:i.globals.minY,h=s.colorScale.max>i.globals.maxY?s.colorScale.max:i.globals.maxY);var c=Math.abs(h)+Math.abs(l),g=100*a/(0===c?c-1e-6:c);s.colorScale.ranges.length>0&&s.colorScale.ranges.map((function(t,e){if(a>=t.from&&a<=t.to){n=t.color,o=t.foreColor?t.foreColor:null,l=t.from,h=t.to;var i=Math.abs(h)+Math.abs(l);g=100*a/(0===i?i-1e-6:i);}}));return {color:n,foreColor:o,percent:g}}},{key:"calculateHeatmapDataLabels",value:function(t){var e=t.x,i=t.y,a=t.i,s=t.j,r=t.heatColorProps,n=(t.series,t.rectHeight),o=t.rectWidth,l=this.w,h=l.config.dataLabels,c=new p(this.ctx),d=new z(this.ctx),g=h.formatter,u=null;if(h.enabled){u=c.group({class:"apexcharts-data-labels"});var f=h.offsetX,x=h.offsetY,b=e+o/2+f,m=i+n/2+parseFloat(h.style.fontSize)/3+x,v=g(l.globals.series[a][s],{seriesIndex:a,dataPointIndex:s,w:l});d.plotDataLabelsText({x:b,y:m,text:v,i:a,j:s,color:r.foreColor,parent:u,dataLabelsConfig:h});}return u}},{key:"animateHeatMap",value:function(t,e,i,a,s,r){var n=new f(this.ctx);n.animateRect(t,{x:e+a/2,y:i+s/2,width:0,height:0},{x:e,y:i,width:a,height:s},r,(function(){n.animationCompleted(t);}));}},{key:"animateHeatColor",value:function(t,e,i,a){t.attr({fill:e}).animate(a).attr({fill:i});}}]),t}(),wt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"drawYAxisTexts",value:function(t,e,i,a){var s=this.w,r=s.config.yaxis[0],n=s.globals.yLabelFormatters[0];return new p(this.ctx).drawText({x:t+r.labels.offsetX,y:e+r.labels.offsetY,text:n(a,i),textAnchor:"middle",fontSize:r.labels.style.fontSize,fontFamily:r.labels.style.fontFamily,foreColor:Array.isArray(r.labels.style.colors)?r.labels.style.colors[i]:r.labels.style.colors})}}]),t}(),kt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;var a=this.w;this.chartType=this.w.config.chart.type,this.initialAnim=this.w.config.chart.animations.enabled,this.dynamicAnim=this.initialAnim&&this.w.config.chart.animations.dynamicAnimation.enabled,this.animBeginArr=[0],this.animDur=0,this.donutDataLabels=this.w.config.plotOptions.pie.donut.labels,this.lineColorArr=void 0!==a.globals.stroke.colors?a.globals.stroke.colors:a.globals.colors,this.defaultSize=a.globals.svgHeight<a.globals.svgWidth?a.globals.gridHeight:a.globals.gridWidth,this.centerY=this.defaultSize/2,this.centerX=a.globals.gridWidth/2,this.fullAngle=360,a.globals.radialSize=this.defaultSize/2.05-a.config.stroke.width-(a.config.chart.sparkline.enabled?0:a.config.chart.dropShadow.blur),this.donutSize=a.globals.radialSize*parseInt(a.config.plotOptions.pie.donut.size,10)/100,this.maxY=0,this.sliceLabels=[],this.sliceSizes=[],this.prevSectorAngleArr=[];}return a(t,[{key:"draw",value:function(t){var e=this,i=this.w,a=new p(this.ctx);if(this.ret=a.group({class:"apexcharts-pie"}),i.globals.noData)return this.ret;for(var s=0,r=0;r<t.length;r++)s+=g.negToZero(t[r]);var n=[],o=a.group();0===s&&(s=1e-5),t.forEach((function(t){e.maxY=Math.max(e.maxY,t);})),"polarArea"===this.chartType&&this.drawPolarElements();for(var l=0;l<t.length;l++){var h=this.fullAngle*g.negToZero(t[l])/s;n.push(h),"polarArea"===this.chartType?(n[l]=this.fullAngle/t.length,this.sliceSizes.push(i.globals.radialSize*t[l]/this.maxY)):this.sliceSizes.push(i.globals.radialSize);}if(i.globals.dataChanged){for(var c,d=0,u=0;u<i.globals.previousPaths.length;u++)d+=g.negToZero(i.globals.previousPaths[u]);for(var f=0;f<i.globals.previousPaths.length;f++)c=this.fullAngle*g.negToZero(i.globals.previousPaths[f])/d,this.prevSectorAngleArr.push(c);}this.donutSize<0&&(this.donutSize=0);var x=i.config.plotOptions.pie.customScale,b=i.globals.gridWidth/2,m=i.globals.gridHeight/2,v=b-i.globals.gridWidth/2*x,y=m-i.globals.gridHeight/2*x;if("donut"===this.chartType){var w=a.drawCircle(this.donutSize);w.attr({cx:this.centerX,cy:this.centerY,fill:i.config.plotOptions.pie.donut.background?i.config.plotOptions.pie.donut.background:"transparent"}),o.add(w);}var k=this.drawArcs(n,t);if(this.sliceLabels.forEach((function(t){k.add(t);})),o.attr({transform:"translate(".concat(v,", ").concat(y,") scale(").concat(x,")")}),o.add(k),this.ret.add(o),this.donutDataLabels.show){var A=this.renderInnerDataLabels(this.donutDataLabels,{hollowSize:this.donutSize,centerX:this.centerX,centerY:this.centerY,opacity:this.donutDataLabels.show,translateX:v,translateY:y});this.ret.add(A);}return this.ret}},{key:"drawArcs",value:function(t,e){var i=this.w,a=new u(this.ctx),s=new p(this.ctx),r=new L(this.ctx),n=s.group({class:"apexcharts-slices"}),o=i.config.plotOptions.pie.startAngle%this.fullAngle,l=o,h=o,c=o,d=o;this.strokeWidth=i.config.stroke.show?i.config.stroke.width:0;for(var f=0;f<t.length;f++){var x=s.group({class:"apexcharts-series apexcharts-pie-series",seriesName:g.escapeString(i.globals.seriesNames[f]),rel:f+1,"data:realIndex":f});n.add(x),h=d,c=(l=c)+t[f],d=h+this.prevSectorAngleArr[f];var b=c<l?this.fullAngle+c-l:c-l,m=r.fillPath({seriesNumber:f,size:this.sliceSizes[f],value:e[f]}),v=this.getChangedPath(h,d),y=s.drawPath({d:v,stroke:this.lineColorArr instanceof Array?this.lineColorArr[f]:this.lineColorArr,strokeWidth:0,fill:m,fillOpacity:i.config.fill.opacity,classes:"apexcharts-pie-area apexcharts-".concat(this.chartType.toLowerCase(),"-slice-").concat(f)});if(y.attr({index:0,j:f}),i.config.chart.dropShadow.enabled){var w=i.config.chart.dropShadow;a.dropShadow(y,w,f);}this.addListeners(y,this.donutDataLabels),p.setAttrs(y.node,{"data:angle":b,"data:startAngle":l,"data:strokeWidth":this.strokeWidth,"data:value":e[f]});var k={x:0,y:0};"pie"===this.chartType||"polarArea"===this.chartType?k=g.polarToCartesian(this.centerX,this.centerY,i.globals.radialSize/1.25+i.config.plotOptions.pie.dataLabels.offset,(l+b/2)%this.fullAngle):"donut"===this.chartType&&(k=g.polarToCartesian(this.centerX,this.centerY,(i.globals.radialSize+this.donutSize)/2+i.config.plotOptions.pie.dataLabels.offset,(l+b/2)%this.fullAngle)),x.add(y);var A=0;if(!this.initialAnim||i.globals.resized||i.globals.dataChanged?this.animBeginArr.push(0):(0===(A=b/this.fullAngle*i.config.chart.animations.speed)&&(A=1),this.animDur=A+this.animDur,this.animBeginArr.push(this.animDur)),this.dynamicAnim&&i.globals.dataChanged?this.animatePaths(y,{size:this.sliceSizes[f],endAngle:c,startAngle:l,prevStartAngle:h,prevEndAngle:d,animateStartingPos:!0,i:f,animBeginArr:this.animBeginArr,shouldSetPrevPaths:!0,dur:i.config.chart.animations.dynamicAnimation.speed}):this.animatePaths(y,{size:this.sliceSizes[f],endAngle:c,startAngle:l,i:f,totalItems:t.length-1,animBeginArr:this.animBeginArr,dur:A}),i.config.plotOptions.pie.expandOnClick&&"polarArea"!==this.chartType&&y.click(this.pieClicked.bind(this,f)),i.config.dataLabels.enabled){var S=k.x,C=k.y,P=100*b/this.fullAngle+"%";if(0!==b&&i.config.plotOptions.pie.dataLabels.minAngleToShowLabel<t[f]){var T=i.config.dataLabels.formatter;void 0!==T&&(P=T(i.globals.seriesPercent[f][0],{seriesIndex:f,w:i}));var z=i.globals.dataLabels.style.colors[f],I=s.drawText({x:S,y:C,text:P,textAnchor:"middle",fontSize:i.config.dataLabels.style.fontSize,fontFamily:i.config.dataLabels.style.fontFamily,fontWeight:i.config.dataLabels.style.fontWeight,foreColor:z});if(i.config.dataLabels.dropShadow.enabled){var M=i.config.dataLabels.dropShadow;a.dropShadow(I,M);}I.node.classList.add("apexcharts-pie-label"),i.config.chart.animations.animate&&!1===i.globals.resized&&(I.node.classList.add("apexcharts-pie-label-delay"),I.node.style.animationDelay=i.config.chart.animations.speed/940+"s"),this.sliceLabels.push(I);}}}return n}},{key:"addListeners",value:function(t,e){var i=new p(this.ctx);t.node.addEventListener("mouseenter",i.pathMouseEnter.bind(this,t)),t.node.addEventListener("mouseleave",i.pathMouseLeave.bind(this,t)),t.node.addEventListener("mouseleave",this.revertDataLabelsInner.bind(this,t.node,e)),t.node.addEventListener("mousedown",i.pathMouseDown.bind(this,t)),this.donutDataLabels.total.showAlways||(t.node.addEventListener("mouseenter",this.printDataLabelsInner.bind(this,t.node,e)),t.node.addEventListener("mousedown",this.printDataLabelsInner.bind(this,t.node,e)));}},{key:"animatePaths",value:function(t,e){var i=this.w,a=e.endAngle<e.startAngle?this.fullAngle+e.endAngle-e.startAngle:e.endAngle-e.startAngle,s=a,r=e.startAngle,n=e.startAngle;void 0!==e.prevStartAngle&&void 0!==e.prevEndAngle&&(r=e.prevEndAngle,s=e.prevEndAngle<e.prevStartAngle?this.fullAngle+e.prevEndAngle-e.prevStartAngle:e.prevEndAngle-e.prevStartAngle),e.i===i.config.series.length-1&&(a+n>this.fullAngle?e.endAngle=e.endAngle-(a+n):a+n<this.fullAngle&&(e.endAngle=e.endAngle+(this.fullAngle-(a+n)))),a===this.fullAngle&&(a=this.fullAngle-.01),this.animateArc(t,r,n,a,s,e);}},{key:"animateArc",value:function(t,e,i,a,s,r){var n,o=this,l=this.w,h=new f(this.ctx),c=r.size;(isNaN(e)||isNaN(s))&&(e=i,s=a,r.dur=0);var d=a,g=i,u=e<i?this.fullAngle+e-i:e-i;l.globals.dataChanged&&r.shouldSetPrevPaths&&r.prevEndAngle&&(n=o.getPiePath({me:o,startAngle:r.prevStartAngle,angle:r.prevEndAngle<r.prevStartAngle?this.fullAngle+r.prevEndAngle-r.prevStartAngle:r.prevEndAngle-r.prevStartAngle,size:c}),t.attr({d:n})),0!==r.dur?t.animate(r.dur,l.globals.easing,r.animBeginArr[r.i]).afterAll((function(){"pie"!==o.chartType&&"donut"!==o.chartType&&"polarArea"!==o.chartType||this.animate(l.config.chart.animations.dynamicAnimation.speed).attr({"stroke-width":o.strokeWidth}),r.i===l.config.series.length-1&&h.animationCompleted(t);})).during((function(l){d=u+(a-u)*l,r.animateStartingPos&&(d=s+(a-s)*l,g=e-s+(i-(e-s))*l),n=o.getPiePath({me:o,startAngle:g,angle:d,size:c}),t.node.setAttribute("data:pathOrig",n),t.attr({d:n});})):(n=o.getPiePath({me:o,startAngle:g,angle:a,size:c}),r.isTrack||(l.globals.animationEnded=!0),t.node.setAttribute("data:pathOrig",n),t.attr({d:n,"stroke-width":o.strokeWidth}));}},{key:"pieClicked",value:function(t){var e,i=this.w,a=this.sliceSizes[t]+(i.config.plotOptions.pie.expandOnClick?4:0),s=i.globals.dom.Paper.select(".apexcharts-".concat(this.chartType.toLowerCase(),"-slice-").concat(t)).members[0];if("true"!==s.attr("data:pieClicked")){var r=i.globals.dom.baseEl.getElementsByClassName("apexcharts-pie-area");Array.prototype.forEach.call(r,(function(t){t.setAttribute("data:pieClicked","false");var e=t.getAttribute("data:pathOrig");t.setAttribute("d",e);})),s.attr("data:pieClicked","true");var n=parseInt(s.attr("data:startAngle"),10),o=parseInt(s.attr("data:angle"),10);e=this.getPiePath({me:this,startAngle:n,angle:o,size:a}),360!==o&&s.plot(e);}else {s.attr({"data:pieClicked":"false"}),this.revertDataLabelsInner(s.node,this.donutDataLabels);var l=s.attr("data:pathOrig");s.attr({d:l});}}},{key:"getChangedPath",value:function(t,e){var i="";return this.dynamicAnim&&this.w.globals.dataChanged&&(i=this.getPiePath({me:this,startAngle:t,angle:e-t,size:this.size})),i}},{key:"getPiePath",value:function(t){var e=t.me,i=t.startAngle,a=t.angle,s=t.size,r=i,n=Math.PI*(r-90)/180,o=a+i;Math.ceil(o)>=this.fullAngle+this.w.config.plotOptions.pie.startAngle%this.fullAngle&&(o=this.fullAngle+this.w.config.plotOptions.pie.startAngle%this.fullAngle-.01),Math.ceil(o)>this.fullAngle&&(o-=this.fullAngle);var l=Math.PI*(o-90)/180,h=e.centerX+s*Math.cos(n),c=e.centerY+s*Math.sin(n),d=e.centerX+s*Math.cos(l),u=e.centerY+s*Math.sin(l),f=g.polarToCartesian(e.centerX,e.centerY,e.donutSize,o),p=g.polarToCartesian(e.centerX,e.centerY,e.donutSize,r),x=a>180?1:0,b=["M",h,c,"A",s,s,0,x,1,d,u];return "donut"===e.chartType?[].concat(b,["L",f.x,f.y,"A",e.donutSize,e.donutSize,0,x,0,p.x,p.y,"L",h,c,"z"]).join(" "):"pie"===e.chartType||"polarArea"===e.chartType?[].concat(b,["L",e.centerX,e.centerY,"L",h,c]).join(" "):[].concat(b).join(" ")}},{key:"drawPolarElements",value:function(){var t=this.w,e=new j(this.ctx),i=new p(this.ctx),a=new wt(this.ctx),s=i.group(),r=i.group(),n=void 0===t.config.yaxis[0].max&&void 0===t.config.yaxis[0].min,o=e.niceScale(0,Math.ceil(this.maxY),t.config.yaxis[0].tickAmount,0,n),l=o.result.reverse(),h=o.result.length;this.maxY=o.niceMax;for(var c=t.globals.radialSize,d=c/(h-1),g=0;g<h-1;g++){var u=i.drawCircle(c);if(u.attr({cx:this.centerX,cy:this.centerY,fill:"none","stroke-width":t.config.plotOptions.polarArea.rings.strokeWidth,stroke:t.config.plotOptions.polarArea.rings.strokeColor}),t.config.yaxis[0].show){var f=a.drawYAxisTexts(this.centerX,this.centerY-c+parseInt(t.config.yaxis[0].labels.style.fontSize,10)/2,g,l[g]);r.add(f);}s.add(u),c-=d;}this.ret.add(s),this.ret.add(r);}},{key:"renderInnerDataLabels",value:function(t,e){var i=this.w,a=new p(this.ctx),s=a.group({class:"apexcharts-datalabels-group",transform:"translate(".concat(e.translateX?e.translateX:0,", ").concat(e.translateY?e.translateY:0,") scale(").concat(i.config.plotOptions.pie.customScale,")")}),r=t.total.show;s.node.style.opacity=e.opacity;var n,o,l=e.centerX,h=e.centerY;n=void 0===t.name.color?i.globals.colors[0]:t.name.color;var c=t.name.fontSize,d=t.name.fontFamily,g=t.value.fontWeight;o=void 0===t.value.color?i.config.chart.foreColor:t.value.color;var u=t.value.formatter,f="",x="";if(r?(n=t.total.color,c=t.total.fontSize,d=t.total.fontFamily,g=t.total.fontWeight,x=t.total.label,f=t.total.formatter(i)):1===i.globals.series.length&&(f=u(i.globals.series[0],i),x=i.globals.seriesNames[0]),x&&(x=t.name.formatter(x,t.total.show,i)),t.name.show){var b=a.drawText({x:l,y:h+parseFloat(t.name.offsetY),text:x,textAnchor:"middle",foreColor:n,fontSize:c,fontWeight:g,fontFamily:d});b.node.classList.add("apexcharts-datalabel-label"),s.add(b);}if(t.value.show){var m=t.name.show?parseFloat(t.value.offsetY)+16:t.value.offsetY,v=a.drawText({x:l,y:h+m,text:f,textAnchor:"middle",foreColor:o,fontWeight:t.value.fontWeight,fontSize:t.value.fontSize,fontFamily:t.value.fontFamily});v.node.classList.add("apexcharts-datalabel-value"),s.add(v);}return s}},{key:"printInnerLabels",value:function(t,e,i,a){var s,r=this.w;a?s=void 0===t.name.color?r.globals.colors[parseInt(a.parentNode.getAttribute("rel"),10)-1]:t.name.color:r.globals.series.length>1&&t.total.show&&(s=t.total.color);var n=r.globals.dom.baseEl.querySelector(".apexcharts-datalabel-label"),o=r.globals.dom.baseEl.querySelector(".apexcharts-datalabel-value");i=(0, t.value.formatter)(i,r),a||"function"!=typeof t.total.formatter||(i=t.total.formatter(r));var l=e===t.total.label;e=t.name.formatter(e,l,r),null!==n&&(n.textContent=e),null!==o&&(o.textContent=i),null!==n&&(n.style.fill=s);}},{key:"printDataLabelsInner",value:function(t,e){var i=this.w,a=t.getAttribute("data:value"),s=i.globals.seriesNames[parseInt(t.parentNode.getAttribute("rel"),10)-1];i.globals.series.length>1&&this.printInnerLabels(e,s,a,t);var r=i.globals.dom.baseEl.querySelector(".apexcharts-datalabels-group");null!==r&&(r.style.opacity=1);}},{key:"revertDataLabelsInner",value:function(t,e,i){var a=this,s=this.w,r=s.globals.dom.baseEl.querySelector(".apexcharts-datalabels-group"),n=!1,o=s.globals.dom.baseEl.getElementsByClassName("apexcharts-pie-area"),l=function(t){var i=t.makeSliceOut,s=t.printLabel;Array.prototype.forEach.call(o,(function(t){"true"===t.getAttribute("data:pieClicked")&&(i&&(n=!0),s&&a.printDataLabelsInner(t,e));}));};if(l({makeSliceOut:!0,printLabel:!1}),e.total.show&&s.globals.series.length>1)n&&!e.total.showAlways?l({makeSliceOut:!1,printLabel:!0}):this.printInnerLabels(e,e.total.label,e.total.formatter(s));else if(l({makeSliceOut:!1,printLabel:!0}),!n)if(s.globals.selectedDataPoints.length&&s.globals.series.length>1)if(s.globals.selectedDataPoints[0].length>0){var h=s.globals.selectedDataPoints[0],c=s.globals.dom.baseEl.querySelector(".apexcharts-".concat(this.chartType.toLowerCase(),"-slice-").concat(h));this.printDataLabelsInner(c,e);}else r&&s.globals.selectedDataPoints.length&&0===s.globals.selectedDataPoints[0].length&&(r.style.opacity=0);else r&&s.globals.series.length>1&&(r.style.opacity=0);}}]),t}(),At=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.chartType=this.w.config.chart.type,this.initialAnim=this.w.config.chart.animations.enabled,this.dynamicAnim=this.initialAnim&&this.w.config.chart.animations.dynamicAnimation.enabled,this.animDur=0;var a=this.w;this.graphics=new p(this.ctx),this.lineColorArr=void 0!==a.globals.stroke.colors?a.globals.stroke.colors:a.globals.colors,this.defaultSize=a.globals.svgHeight<a.globals.svgWidth?a.globals.gridHeight+1.5*a.globals.goldenPadding:a.globals.gridWidth,this.maxValue=this.w.globals.maxY,this.minValue=this.w.globals.minY,this.polygons=a.config.plotOptions.radar.polygons;var s=a.globals.labels.slice().sort((function(t,e){return e.length-t.length}))[0],r=this.graphics.getTextRects(s,a.config.xaxis.labels.style.fontSize);this.strokeWidth=a.config.stroke.show?a.config.stroke.width:0,this.size=this.defaultSize/2.1-this.strokeWidth-a.config.chart.dropShadow.blur,a.config.xaxis.labels.show&&(this.size=this.size-r.width/1.75),void 0!==a.config.plotOptions.radar.size&&(this.size=a.config.plotOptions.radar.size),this.dataRadiusOfPercent=[],this.dataRadius=[],this.angleArr=[],this.yaxisLabelsTextsPos=[];}return a(t,[{key:"draw",value:function(t){var e=this,i=this.w,a=new L(this.ctx),s=[],r=new z(this.ctx);t.length&&(this.dataPointsLen=t[i.globals.maxValsInArrayIndex].length),this.disAngle=2*Math.PI/this.dataPointsLen;var o=i.globals.gridWidth/2,l=i.globals.gridHeight/2,h=o+i.config.plotOptions.radar.offsetX,c=l+i.config.plotOptions.radar.offsetY,d=this.graphics.group({class:"apexcharts-radar-series apexcharts-plot-series",transform:"translate(".concat(h||0,", ").concat(c||0,")")}),f=[],p=null,x=null;if(this.yaxisLabels=this.graphics.group({class:"apexcharts-yaxis"}),t.forEach((function(t,o){var l=t.length===i.globals.dataPoints,h=e.graphics.group().attr({class:"apexcharts-series","data:longestSeries":l,seriesName:g.escapeString(i.globals.seriesNames[o]),rel:o+1,"data:realIndex":o});e.dataRadiusOfPercent[o]=[],e.dataRadius[o]=[],e.angleArr[o]=[],t.forEach((function(t,i){var a=Math.abs(e.maxValue-e.minValue);t+=Math.abs(e.minValue),e.dataRadiusOfPercent[o][i]=t/a,e.dataRadius[o][i]=e.dataRadiusOfPercent[o][i]*e.size,e.angleArr[o][i]=i*e.disAngle;})),f=e.getDataPointsPos(e.dataRadius[o],e.angleArr[o]);var c=e.createPaths(f,{x:0,y:0});p=e.graphics.group({class:"apexcharts-series-markers-wrap apexcharts-element-hidden"}),x=e.graphics.group({class:"apexcharts-datalabels","data:realIndex":o}),i.globals.delayedElements.push({el:p.node,index:o});var d={i:o,realIndex:o,animationDelay:o,initialSpeed:i.config.chart.animations.speed,dataChangeSpeed:i.config.chart.animations.dynamicAnimation.speed,className:"apexcharts-radar",shouldClipToGrid:!1,bindEventsOnPaths:!1,stroke:i.globals.stroke.colors[o],strokeLineCap:i.config.stroke.lineCap},b=null;i.globals.previousPaths.length>0&&(b=e.getPreviousPath(o));for(var m=0;m<c.linePathsTo.length;m++){var v=e.graphics.renderPaths(n({},d,{pathFrom:null===b?c.linePathsFrom[m]:b,pathTo:c.linePathsTo[m],strokeWidth:Array.isArray(e.strokeWidth)?e.strokeWidth[o]:e.strokeWidth,fill:"none",drawShadow:!1}));h.add(v);var y=a.fillPath({seriesNumber:o}),w=e.graphics.renderPaths(n({},d,{pathFrom:null===b?c.areaPathsFrom[m]:b,pathTo:c.areaPathsTo[m],strokeWidth:0,fill:y,drawShadow:!1}));if(i.config.chart.dropShadow.enabled){var k=new u(e.ctx),A=i.config.chart.dropShadow;k.dropShadow(w,Object.assign({},A,{noUserSpaceOnUse:!0}),o);}h.add(w);}t.forEach((function(t,a){var s=new P(e.ctx).getMarkerConfig("apexcharts-marker",o,a),l=e.graphics.drawMarker(f[a].x,f[a].y,s);l.attr("rel",a),l.attr("j",a),l.attr("index",o),l.node.setAttribute("default-marker-size",s.pSize);var c=e.graphics.group({class:"apexcharts-series-markers"});c&&c.add(l),p.add(c),h.add(p);var d=i.config.dataLabels;if(d.enabled){var g=d.formatter(i.globals.series[o][a],{seriesIndex:o,dataPointIndex:a,w:i});r.plotDataLabelsText({x:f[a].x,y:f[a].y,text:g,textAnchor:"middle",i:o,j:o,parent:x,offsetCorrection:!1,dataLabelsConfig:n({},d)});}h.add(x);})),s.push(h);})),this.drawPolygons({parent:d}),i.config.xaxis.labels.show){var b=this.drawXAxisTexts();d.add(b);}return d.add(this.yaxisLabels),s.forEach((function(t){d.add(t);})),d}},{key:"drawPolygons",value:function(t){for(var e=this,i=this.w,a=t.parent,s=new wt(this.ctx),r=i.globals.yAxisScale[0].result.reverse(),n=r.length,o=[],l=this.size/(n-1),h=0;h<n;h++)o[h]=l*h;o.reverse();var c=[],d=[];o.forEach((function(t,i){var a=e.getPolygonPos(t),s="";a.forEach((function(t,a){if(0===i){var r=e.graphics.drawLine(t.x,t.y,0,0,Array.isArray(e.polygons.connectorColors)?e.polygons.connectorColors[a]:e.polygons.connectorColors);d.push(r);}0===a&&e.yaxisLabelsTextsPos.push({x:t.x,y:t.y}),s+=t.x+","+t.y+" ";})),c.push(s);})),c.forEach((function(t,s){var r=e.polygons.strokeColors,n=e.polygons.strokeWidth,o=e.graphics.drawPolygon(t,Array.isArray(r)?r[s]:r,Array.isArray(n)?n[s]:n,i.globals.radarPolygons.fill.colors[s]);a.add(o);})),d.forEach((function(t){a.add(t);})),i.config.yaxis[0].show&&this.yaxisLabelsTextsPos.forEach((function(t,i){var a=s.drawYAxisTexts(t.x,t.y,i,r[i]);e.yaxisLabels.add(a);}));}},{key:"drawXAxisTexts",value:function(){var t=this,e=this.w,i=e.config.xaxis.labels,a=this.graphics.group({class:"apexcharts-xaxis"}),s=this.getPolygonPos(this.size);return e.globals.labels.forEach((function(r,o){var l=e.config.xaxis.labels.formatter,h=new z(t.ctx);if(s[o]){var c=t.getTextPos(s[o],t.size),d=l(r,{seriesIndex:-1,dataPointIndex:o,w:e});h.plotDataLabelsText({x:c.newX,y:c.newY,text:d,textAnchor:c.textAnchor,i:o,j:o,parent:a,color:i.style.colors[o]?i.style.colors[o]:"#a8a8a8",dataLabelsConfig:n({textAnchor:c.textAnchor,dropShadow:{enabled:!1}},i),offsetCorrection:!1});}})),a}},{key:"createPaths",value:function(t,e){var i=this,a=[],s=[],r=[],n=[];if(t.length){s=[this.graphics.move(e.x,e.y)],n=[this.graphics.move(e.x,e.y)];var o=this.graphics.move(t[0].x,t[0].y),l=this.graphics.move(t[0].x,t[0].y);t.forEach((function(e,a){o+=i.graphics.line(e.x,e.y),l+=i.graphics.line(e.x,e.y),a===t.length-1&&(o+="Z",l+="Z");})),a.push(o),r.push(l);}return {linePathsFrom:s,linePathsTo:a,areaPathsFrom:n,areaPathsTo:r}}},{key:"getTextPos",value:function(t,e){var i="middle",a=t.x,s=t.y;return Math.abs(t.x)>=10?t.x>0?(i="start",a+=10):t.x<0&&(i="end",a-=10):i="middle",Math.abs(t.y)>=e-10&&(t.y<0?s-=10:t.y>0&&(s+=10)),{textAnchor:i,newX:a,newY:s}}},{key:"getPreviousPath",value:function(t){for(var e=this.w,i=null,a=0;a<e.globals.previousPaths.length;a++){var s=e.globals.previousPaths[a];s.paths.length>0&&parseInt(s.realIndex,10)===parseInt(t,10)&&void 0!==e.globals.previousPaths[a].paths[0]&&(i=e.globals.previousPaths[a].paths[0].d);}return i}},{key:"getDataPointsPos",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.dataPointsLen;t=t||[],e=e||[];for(var a=[],s=0;s<i;s++){var r={};r.x=t[s]*Math.sin(e[s]),r.y=-t[s]*Math.cos(e[s]),a.push(r);}return a}},{key:"getPolygonPos",value:function(t){for(var e=[],i=2*Math.PI/this.dataPointsLen,a=0;a<this.dataPointsLen;a++){var s={};s.x=t*Math.sin(a*i),s.y=-t*Math.cos(a*i),e.push(s);}return e}}]),t}(),St=function(t){function i(t){var a;e(this,i),(a=c(this,l(i).call(this,t))).ctx=t,a.w=t.w,a.animBeginArr=[0],a.animDur=0;var s=a.w;return a.startAngle=s.config.plotOptions.radialBar.startAngle,a.endAngle=s.config.plotOptions.radialBar.endAngle,a.totalAngle=Math.abs(s.config.plotOptions.radialBar.endAngle-s.config.plotOptions.radialBar.startAngle),a.trackStartAngle=s.config.plotOptions.radialBar.track.startAngle,a.trackEndAngle=s.config.plotOptions.radialBar.track.endAngle,a.radialDataLabels=s.config.plotOptions.radialBar.dataLabels,a.trackStartAngle||(a.trackStartAngle=a.startAngle),a.trackEndAngle||(a.trackEndAngle=a.endAngle),360===a.endAngle&&(a.endAngle=359.99),a.margin=parseInt(s.config.plotOptions.radialBar.track.margin,10),a}return o(i,kt),a(i,[{key:"draw",value:function(t){var e=this.w,i=new p(this.ctx),a=i.group({class:"apexcharts-radialbar"});if(e.globals.noData)return a;var s=i.group(),r=this.defaultSize/2,n=e.globals.gridWidth/2,o=this.defaultSize/2.05;e.config.chart.sparkline.enabled||(o=o-e.config.stroke.width-e.config.chart.dropShadow.blur);var l=e.globals.fill.colors;if(e.config.plotOptions.radialBar.track.show){var h=this.drawTracks({size:o,centerX:n,centerY:r,colorArr:l,series:t});s.add(h);}var c=this.drawArcs({size:o,centerX:n,centerY:r,colorArr:l,series:t}),d=360;e.config.plotOptions.radialBar.startAngle<0&&(d=this.totalAngle);var g=(360-d)/360;if(e.globals.radialSize=o-o*g,this.radialDataLabels.value.show){var u=Math.max(this.radialDataLabels.value.offsetY,this.radialDataLabels.name.offsetY);e.globals.radialSize+=u*g;}return s.add(c.g),"front"===e.config.plotOptions.radialBar.hollow.position&&(c.g.add(c.elHollow),c.dataLabels&&c.g.add(c.dataLabels)),a.add(s),a}},{key:"drawTracks",value:function(t){var e=this.w,i=new p(this.ctx),a=i.group({class:"apexcharts-tracks"}),s=new u(this.ctx),r=new L(this.ctx),n=this.getStrokeWidth(t);t.size=t.size-n/2;for(var o=0;o<t.series.length;o++){var l=i.group({class:"apexcharts-radialbar-track apexcharts-track"});a.add(l),l.attr({rel:o+1}),t.size=t.size-n-this.margin;var h=e.config.plotOptions.radialBar.track,c=r.fillPath({seriesNumber:0,size:t.size,fillColors:Array.isArray(h.background)?h.background[o]:h.background,solid:!0}),d=this.trackStartAngle,g=this.trackEndAngle;Math.abs(g)+Math.abs(d)>=360&&(g=360-Math.abs(this.startAngle)-.1);var f=i.drawPath({d:"",stroke:c,strokeWidth:n*parseInt(h.strokeWidth,10)/100,fill:"none",strokeOpacity:h.opacity,classes:"apexcharts-radialbar-area"});if(h.dropShadow.enabled){var x=h.dropShadow;s.dropShadow(f,x);}l.add(f),f.attr("id","apexcharts-radialbarTrack-"+o),this.animatePaths(f,{centerX:t.centerX,centerY:t.centerY,endAngle:g,startAngle:d,size:t.size,i:o,totalItems:2,animBeginArr:0,dur:0,isTrack:!0,easing:e.globals.easing});}return a}},{key:"drawArcs",value:function(t){var e=this.w,i=new p(this.ctx),a=new L(this.ctx),s=new u(this.ctx),r=i.group(),n=this.getStrokeWidth(t);t.size=t.size-n/2;var o=e.config.plotOptions.radialBar.hollow.background,l=t.size-n*t.series.length-this.margin*t.series.length-n*parseInt(e.config.plotOptions.radialBar.track.strokeWidth,10)/100/2,h=l-e.config.plotOptions.radialBar.hollow.margin;void 0!==e.config.plotOptions.radialBar.hollow.image&&(o=this.drawHollowImage(t,r,l,o));var c=this.drawHollow({size:h,centerX:t.centerX,centerY:t.centerY,fill:o||"transparent"});if(e.config.plotOptions.radialBar.hollow.dropShadow.enabled){var d=e.config.plotOptions.radialBar.hollow.dropShadow;s.dropShadow(c,d);}var f=1;!this.radialDataLabels.total.show&&e.globals.series.length>1&&(f=0);var x=null;this.radialDataLabels.show&&(x=this.renderInnerDataLabels(this.radialDataLabels,{hollowSize:l,centerX:t.centerX,centerY:t.centerY,opacity:f})),"back"===e.config.plotOptions.radialBar.hollow.position&&(r.add(c),x&&r.add(x));var b=!1;e.config.plotOptions.radialBar.inverseOrder&&(b=!0);for(var m=b?t.series.length-1:0;b?m>=0:m<t.series.length;b?m--:m++){var v=i.group({class:"apexcharts-series apexcharts-radial-series",seriesName:g.escapeString(e.globals.seriesNames[m])});r.add(v),v.attr({rel:m+1,"data:realIndex":m}),this.ctx.series.addCollapsedClassToSeries(v,m),t.size=t.size-n-this.margin;var y=a.fillPath({seriesNumber:m,size:t.size,value:t.series[m]}),w=this.startAngle,k=void 0,A=g.negToZero(t.series[m]>100?100:t.series[m])/100,S=Math.round(this.totalAngle*A)+this.startAngle,C=void 0;e.globals.dataChanged&&(k=this.startAngle,C=Math.round(this.totalAngle*g.negToZero(e.globals.previousPaths[m])/100)+k),Math.abs(S)+Math.abs(w)>=360&&(S-=.01),Math.abs(C)+Math.abs(k)>=360&&(C-=.01);var P=S-w,T=Array.isArray(e.config.stroke.dashArray)?e.config.stroke.dashArray[m]:e.config.stroke.dashArray,z=i.drawPath({d:"",stroke:y,strokeWidth:n,fill:"none",fillOpacity:e.config.fill.opacity,classes:"apexcharts-radialbar-area apexcharts-radialbar-slice-"+m,strokeDashArray:T});if(p.setAttrs(z.node,{"data:angle":P,"data:value":t.series[m]}),e.config.chart.dropShadow.enabled){var I=e.config.chart.dropShadow;s.dropShadow(z,I,m);}this.addListeners(z,this.radialDataLabels),v.add(z),z.attr({index:0,j:m});var M=0;!this.initialAnim||e.globals.resized||e.globals.dataChanged||(M=(S-w)/360*e.config.chart.animations.speed,this.animDur=M/(1.2*t.series.length)+this.animDur,this.animBeginArr.push(this.animDur)),e.globals.dataChanged&&(M=(S-w)/360*e.config.chart.animations.dynamicAnimation.speed,this.animDur=M/(1.2*t.series.length)+this.animDur,this.animBeginArr.push(this.animDur)),this.animatePaths(z,{centerX:t.centerX,centerY:t.centerY,endAngle:S,startAngle:w,prevEndAngle:C,prevStartAngle:k,size:t.size,i:m,totalItems:2,animBeginArr:this.animBeginArr,dur:M,shouldSetPrevPaths:!0,easing:e.globals.easing});}return {g:r,elHollow:c,dataLabels:x}}},{key:"drawHollow",value:function(t){var e=new p(this.ctx).drawCircle(2*t.size);return e.attr({class:"apexcharts-radialbar-hollow",cx:t.centerX,cy:t.centerY,r:t.size,fill:t.fill}),e}},{key:"drawHollowImage",value:function(t,e,i,a){var s=this.w,r=new L(this.ctx),n=g.randomId(),o=s.config.plotOptions.radialBar.hollow.image;if(s.config.plotOptions.radialBar.hollow.imageClipped)r.clippedImgArea({width:i,height:i,image:o,patternID:"pattern".concat(s.globals.cuid).concat(n)}),a="url(#pattern".concat(s.globals.cuid).concat(n,")");else {var l=s.config.plotOptions.radialBar.hollow.imageWidth,h=s.config.plotOptions.radialBar.hollow.imageHeight;if(void 0===l&&void 0===h){var c=s.globals.dom.Paper.image(o).loaded((function(e){this.move(t.centerX-e.width/2+s.config.plotOptions.radialBar.hollow.imageOffsetX,t.centerY-e.height/2+s.config.plotOptions.radialBar.hollow.imageOffsetY);}));e.add(c);}else {var d=s.globals.dom.Paper.image(o).loaded((function(e){this.move(t.centerX-l/2+s.config.plotOptions.radialBar.hollow.imageOffsetX,t.centerY-h/2+s.config.plotOptions.radialBar.hollow.imageOffsetY),this.size(l,h);}));e.add(d);}}return a}},{key:"getStrokeWidth",value:function(t){var e=this.w;return t.size*(100-parseInt(e.config.plotOptions.radialBar.hollow.size,10))/100/(t.series.length+1)-this.margin}}]),i}(),Ct=function(){function t(i){e(this,t),this.w=i.w,this.lineCtx=i;}return a(t,[{key:"sameValueSeriesFix",value:function(t,e){var i=this.w;if("line"===i.config.chart.type&&("gradient"===i.config.fill.type||"gradient"===i.config.fill.type[t])&&new m(this.lineCtx.ctx,i).seriesHaveSameValues(t)){var a=e[t].slice();a[a.length-1]=a[a.length-1]+1e-6,e[t]=a;}return e}},{key:"calculatePoints",value:function(t){var e=t.series,i=t.realIndex,a=t.x,s=t.y,r=t.i,n=t.j,o=t.prevY,l=this.w,h=[],c=[];if(0===n){var d=this.lineCtx.categoryAxisCorrection+l.config.markers.offsetX;l.globals.isXNumeric&&(d=(l.globals.seriesX[i][0]-l.globals.minX)/this.lineCtx.xRatio+l.config.markers.offsetX),h.push(d),c.push(g.isNumber(e[r][0])?o+l.config.markers.offsetY:null),h.push(a+l.config.markers.offsetX),c.push(g.isNumber(e[r][n+1])?s+l.config.markers.offsetY:null);}else h.push(a+l.config.markers.offsetX),c.push(g.isNumber(e[r][n+1])?s+l.config.markers.offsetY:null);return {x:h,y:c}}},{key:"checkPreviousPaths",value:function(t){for(var e=t.pathFromLine,i=t.pathFromArea,a=t.realIndex,s=this.w,r=0;r<s.globals.previousPaths.length;r++){var n=s.globals.previousPaths[r];("line"===n.type||"area"===n.type)&&n.paths.length>0&&parseInt(n.realIndex,10)===parseInt(a,10)&&("line"===n.type?(this.lineCtx.appendPathFrom=!1,e=s.globals.previousPaths[r].paths[0].d):"area"===n.type&&(this.lineCtx.appendPathFrom=!1,i=s.globals.previousPaths[r].paths[0].d,s.config.stroke.show&&s.globals.previousPaths[r].paths[1]&&(e=s.globals.previousPaths[r].paths[1].d)));}return {pathFromLine:e,pathFromArea:i}}},{key:"determineFirstPrevY",value:function(t){var e=t.i,i=t.series,a=t.prevY,s=t.lineYPosition,r=this.w;if(void 0!==i[e][0])a=(s=r.config.chart.stacked&&e>0?this.lineCtx.prevSeriesY[e-1][0]:this.lineCtx.zeroY)-i[e][0]/this.lineCtx.yRatio[this.lineCtx.yaxisIndex]+2*(this.lineCtx.isReversed?i[e][0]/this.lineCtx.yRatio[this.lineCtx.yaxisIndex]:0);else if(r.config.chart.stacked&&e>0&&void 0===i[e][0])for(var n=e-1;n>=0;n--)if(null!==i[n][0]&&void 0!==i[n][0]){a=s=this.lineCtx.prevSeriesY[n][0];break}return {prevY:a,lineYPosition:s}}}]),t}(),Lt=function(){function t(i,a,s){e(this,t),this.ctx=i,this.w=i.w,this.xyRatios=a,this.pointsChart=!("bubble"!==this.w.config.chart.type&&"scatter"!==this.w.config.chart.type)||s,this.scatter=new T(this.ctx),this.noNegatives=this.w.globals.minX===Number.MAX_VALUE,this.lineHelpers=new Ct(this),this.markers=new P(this.ctx),this.prevSeriesY=[],this.categoryAxisCorrection=0,this.yaxisIndex=0;}return a(t,[{key:"draw",value:function(t,e,i){var a=this.w,s=new p(this.ctx),r=a.globals.comboCharts?e:a.config.chart.type,n=s.group({class:"apexcharts-".concat(r,"-series apexcharts-plot-series")}),o=new m(this.ctx,a);this.yRatio=this.xyRatios.yRatio,this.zRatio=this.xyRatios.zRatio,this.xRatio=this.xyRatios.xRatio,this.baseLineY=this.xyRatios.baseLineY,t=o.getLogSeries(t),this.yRatio=o.getLogYRatios(this.yRatio);for(var l=[],h=0;h<t.length;h++){t=this.lineHelpers.sameValueSeriesFix(h,t);var c=a.globals.comboCharts?i[h]:h;this._initSerieVariables(t,h,c);var d=[],g=[],u=a.globals.padHorizontal+this.categoryAxisCorrection;this.ctx.series.addCollapsedClassToSeries(this.elSeries,c),a.globals.isXNumeric&&a.globals.seriesX.length>0&&(u=(a.globals.seriesX[c][0]-a.globals.minX)/this.xRatio),g.push(u);var f,x=u,b=x,v=this.zeroY;v=this.lineHelpers.determineFirstPrevY({i:h,series:t,prevY:v,lineYPosition:0}).prevY,d.push(v),f=v;var y=this._calculatePathsFrom({series:t,i:h,realIndex:c,prevX:b,prevY:v}),w=this._iterateOverDataPoints({series:t,realIndex:c,i:h,x:u,y:1,pX:x,pY:f,pathsFrom:y,linePaths:[],areaPaths:[],seriesIndex:i,lineYPosition:0,xArrj:g,yArrj:d});this._handlePaths({type:r,realIndex:c,i:h,paths:w}),this.elSeries.add(this.elPointsMain),this.elSeries.add(this.elDataLabelsWrap),l.push(this.elSeries);}for(var k=l.length;k>0;k--)n.add(l[k-1]);return n}},{key:"_initSerieVariables",value:function(t,e,i){var a=this.w,s=new p(this.ctx);this.xDivision=a.globals.gridWidth/(a.globals.dataPoints-("on"===a.config.xaxis.tickPlacement?1:0)),this.strokeWidth=Array.isArray(a.config.stroke.width)?a.config.stroke.width[i]:a.config.stroke.width,this.yRatio.length>1&&(this.yaxisIndex=i),this.isReversed=a.config.yaxis[this.yaxisIndex]&&a.config.yaxis[this.yaxisIndex].reversed,this.zeroY=a.globals.gridHeight-this.baseLineY[this.yaxisIndex]-(this.isReversed?a.globals.gridHeight:0)+(this.isReversed?2*this.baseLineY[this.yaxisIndex]:0),this.areaBottomY=this.zeroY,this.zeroY>a.globals.gridHeight&&(this.areaBottomY=a.globals.gridHeight),this.categoryAxisCorrection=this.xDivision/2,this.elSeries=s.group({class:"apexcharts-series",seriesName:g.escapeString(a.globals.seriesNames[i])}),this.elPointsMain=s.group({class:"apexcharts-series-markers-wrap","data:realIndex":i}),this.elDataLabelsWrap=s.group({class:"apexcharts-datalabels","data:realIndex":i});var r=t[e].length===a.globals.dataPoints;this.elSeries.attr({"data:longestSeries":r,rel:e+1,"data:realIndex":i}),this.appendPathFrom=!0;}},{key:"_calculatePathsFrom",value:function(t){var e,i,a,s,r=t.series,n=t.i,o=t.realIndex,l=t.prevX,h=t.prevY,c=this.w,d=new p(this.ctx);if(null===r[n][0]){for(var g=0;g<r[n].length;g++)if(null!==r[n][g]){l=this.xDivision*g,h=this.zeroY-r[n][g]/this.yRatio[this.yaxisIndex],e=d.move(l,h),i=d.move(l,this.areaBottomY);break}}else e=d.move(l,h),i=d.move(l,this.areaBottomY)+d.line(l,h);if(a=d.move(-1,this.zeroY)+d.line(-1,this.zeroY),s=d.move(-1,this.zeroY)+d.line(-1,this.zeroY),c.globals.previousPaths.length>0){var u=this.lineHelpers.checkPreviousPaths({pathFromLine:a,pathFromArea:s,realIndex:o});a=u.pathFromLine,s=u.pathFromArea;}return {prevX:l,prevY:h,linePath:e,areaPath:i,pathFromLine:a,pathFromArea:s}}},{key:"_handlePaths",value:function(t){var e=t.type,i=t.realIndex,a=t.i,s=t.paths,r=this.w,o=new p(this.ctx),l=new L(this.ctx);this.prevSeriesY.push(s.yArrj),r.globals.seriesXvalues[i]=s.xArrj,r.globals.seriesYvalues[i]=s.yArrj,this.pointsChart||r.globals.delayedElements.push({el:this.elPointsMain.node,index:i});var h={i:a,realIndex:i,animationDelay:a,initialSpeed:r.config.chart.animations.speed,dataChangeSpeed:r.config.chart.animations.dynamicAnimation.speed,className:"apexcharts-".concat(e)};if("area"===e)for(var c=l.fillPath({seriesNumber:i}),d=0;d<s.areaPaths.length;d++){var g=o.renderPaths(n({},h,{pathFrom:s.pathFromArea,pathTo:s.areaPaths[d],stroke:"none",strokeWidth:0,strokeLineCap:null,fill:c}));this.elSeries.add(g);}if(r.config.stroke.show&&!this.pointsChart){var u=null;u="line"===e?l.fillPath({seriesNumber:i,i:a}):r.globals.stroke.colors[i];for(var f=0;f<s.linePaths.length;f++){var x=o.renderPaths(n({},h,{pathFrom:s.pathFromLine,pathTo:s.linePaths[f],stroke:u,strokeWidth:this.strokeWidth,strokeLineCap:r.config.stroke.lineCap,fill:"none"}));this.elSeries.add(x);}}}},{key:"_iterateOverDataPoints",value:function(t){for(var e=t.series,i=t.realIndex,a=t.i,s=t.x,r=t.y,n=t.pX,o=t.pY,l=t.pathsFrom,h=t.linePaths,c=t.areaPaths,d=t.seriesIndex,u=t.lineYPosition,f=t.xArrj,x=t.yArrj,b=this.w,m=new p(this.ctx),v=this.yRatio,y=l.prevY,w=l.linePath,k=l.areaPath,A=l.pathFromLine,S=l.pathFromArea,C=g.isNumber(b.globals.minYArr[i])?b.globals.minYArr[i]:b.globals.minY,L=b.globals.dataPoints>1?b.globals.dataPoints-1:b.globals.dataPoints,P=0;P<L;P++){var T=void 0===e[a][P+1]||null===e[a][P+1];if(b.globals.isXNumeric){var z=b.globals.seriesX[i][P+1];void 0===b.globals.seriesX[i][P+1]&&(z=b.globals.seriesX[i][L-1]),s=(z-b.globals.minX)/this.xRatio;}else s+=this.xDivision;if(b.config.chart.stacked)if(a>0&&b.globals.collapsedSeries.length<b.config.series.length-1){u=this.prevSeriesY[function(t){for(var e=t,i=0;i<b.globals.series.length;i++)if(b.globals.collapsedSeriesIndices.indexOf(t)>-1){e--;break}return e>=0?e:0}(a-1)][P+1];}else u=this.zeroY;else u=this.zeroY;r=T?u-C/v[this.yaxisIndex]+2*(this.isReversed?C/v[this.yaxisIndex]:0):u-e[a][P+1]/v[this.yaxisIndex]+2*(this.isReversed?e[a][P+1]/v[this.yaxisIndex]:0),f.push(s),x.push(r);var I=this.lineHelpers.calculatePoints({series:e,x:s,y:r,realIndex:i,i:a,j:P,prevY:y}),M=this._createPaths({series:e,i:a,realIndex:i,j:P,x:s,y:r,pX:n,pY:o,linePath:w,areaPath:k,linePaths:h,areaPaths:c,seriesIndex:d});c=M.areaPaths,h=M.linePaths,n=M.pX,o=M.pY,k=M.areaPath,w=M.linePath,this.appendPathFrom&&(A+=m.line(s,this.zeroY),S+=m.line(s,this.zeroY)),this.handleNullDataPoints(e,I,a,P,i),this._handleMarkersAndLabels({pointsPos:I,series:e,x:s,y:r,prevY:y,i:a,j:P,realIndex:i});}return {yArrj:x,xArrj:f,pathFromArea:S,areaPaths:c,pathFromLine:A,linePaths:h}}},{key:"_handleMarkersAndLabels",value:function(t){var e=t.pointsPos,i=(t.series,t.x,t.y,t.prevY,t.i),a=t.j,s=t.realIndex,r=this.w,n=new z(this.ctx);if(this.pointsChart)this.scatter.draw(this.elSeries,a,{realIndex:s,pointsPos:e,zRatio:this.zRatio,elParent:this.elPointsMain});else {r.globals.series[i].length>1&&this.elPointsMain.node.classList.add("apexcharts-element-hidden");var o=this.markers.plotChartMarkers(e,s,a+1);null!==o&&this.elPointsMain.add(o);}var l=n.drawDataLabel(e,s,a+1,null);null!==l&&this.elDataLabelsWrap.add(l);}},{key:"_createPaths",value:function(t){var e=t.series,i=t.i,a=t.realIndex,s=t.j,r=t.x,n=t.y,o=t.pX,l=t.pY,h=t.linePath,c=t.areaPath,d=t.linePaths,g=t.areaPaths,u=t.seriesIndex,f=this.w,x=new p(this.ctx),b=f.config.stroke.curve,m=this.areaBottomY;if(Array.isArray(f.config.stroke.curve)&&(b=Array.isArray(u)?f.config.stroke.curve[u[i]]:f.config.stroke.curve[i]),"smooth"===b){var v=.35*(r-o);f.globals.hasNullValues?(null!==e[i][s]&&(null!==e[i][s+1]?(h=x.move(o,l)+x.curve(o+v,l,r-v,n,r+1,n),c=x.move(o+1,l)+x.curve(o+v,l,r-v,n,r+1,n)+x.line(r,m)+x.line(o,m)+"z"):(h=x.move(o,l),c=x.move(o,l)+"z")),d.push(h),g.push(c)):(h+=x.curve(o+v,l,r-v,n,r,n),c+=x.curve(o+v,l,r-v,n,r,n)),o=r,l=n,s===e[i].length-2&&(c=c+x.curve(o,l,r,n,r,m)+x.move(r,n)+"z",f.globals.hasNullValues||(d.push(h),g.push(c)));}else {if(null===e[i][s+1]){h+=x.move(r,n);var y=f.globals.isXNumeric?(f.globals.seriesX[a][s]-f.globals.minX)/this.xRatio:r-this.xDivision;c=c+x.line(y,m)+x.move(r,n)+"z";}null===e[i][s]&&(h+=x.move(r,n),c+=x.move(r,m)),"stepline"===b?(h=h+x.line(r,null,"H")+x.line(null,n,"V"),c=c+x.line(r,null,"H")+x.line(null,n,"V")):"straight"===b&&(h+=x.line(r,n),c+=x.line(r,n)),s===e[i].length-2&&(c=c+x.line(r,m)+x.move(r,n)+"z",d.push(h),g.push(c));}return {linePaths:d,areaPaths:g,pX:o,pY:l,linePath:h,areaPath:c}}},{key:"handleNullDataPoints",value:function(t,e,i,a,s){var r=this.w;if(null===t[i][a]&&r.config.markers.showNullDataPoints||1===t[i].length){var n=this.markers.plotChartMarkers(e,s,a+1,this.strokeWidth-r.config.markers.strokeWidth/2,!0);null!==n&&this.elPointsMain.add(n);}}}]),t}(),Pt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w,this.timeScaleArray=[],this.utc=this.w.config.xaxis.labels.datetimeUTC;}return a(t,[{key:"calculateTimeScaleTicks",value:function(t,e){var i=this,a=this.w;if(a.globals.allSeriesCollapsed)return a.globals.labels=[],a.globals.timescaleLabels=[],[];var s=new Y(this.ctx),r=(e-t)/864e5;this.determineInterval(r),a.globals.disableZoomIn=!1,a.globals.disableZoomOut=!1,r<.005?a.globals.disableZoomIn=!0:r>5e4&&(a.globals.disableZoomOut=!0);var o=s.getTimeUnitsfromTimestamp(t,e,this.utc),l=a.globals.gridWidth/r,h=l/24,c=h/60,d=Math.floor(24*r),g=Math.floor(24*r*60),u=Math.floor(r),f=Math.floor(r/30),p=Math.floor(r/365),x={minMinute:o.minMinute,minHour:o.minHour,minDate:o.minDate,minMonth:o.minMonth,minYear:o.minYear},b={firstVal:x,currentMinute:x.minMinute,currentHour:x.minHour,currentMonthDate:x.minDate,currentDate:x.minDate,currentMonth:x.minMonth,currentYear:x.minYear,daysWidthOnXAxis:l,hoursWidthOnXAxis:h,minutesWidthOnXAxis:c,numberOfMinutes:g,numberOfHours:d,numberOfDays:u,numberOfMonths:f,numberOfYears:p};switch(this.tickInterval){case"years":this.generateYearScale(b);break;case"months":case"half_year":this.generateMonthScale(b);break;case"months_days":case"months_fortnight":case"days":case"week_days":this.generateDayScale(b);break;case"hours":this.generateHourScale(b);break;case"minutes":this.generateMinuteScale(b);}var m=this.timeScaleArray.map((function(t){var e={position:t.position,unit:t.unit,year:t.year,day:t.day?t.day:1,hour:t.hour?t.hour:0,month:t.month+1};return "month"===t.unit?n({},e,{day:1,value:t.value+1}):"day"===t.unit||"hour"===t.unit?n({},e,{value:t.value}):"minute"===t.unit?n({},e,{value:t.value,minute:t.value}):t}));return m.filter((function(t){var e=1,s=Math.ceil(a.globals.gridWidth/120),r=t.value;void 0!==a.config.xaxis.tickAmount&&(s=a.config.xaxis.tickAmount),m.length>s&&(e=Math.floor(m.length/s));var n=!1,o=!1;switch(i.tickInterval){case"years":"year"===t.unit&&(n=!0);break;case"half_year":e=7,"year"===t.unit&&(n=!0);break;case"months":e=1,"year"===t.unit&&(n=!0);break;case"months_fortnight":e=15,"year"!==t.unit&&"month"!==t.unit||(n=!0),30===r&&(o=!0);break;case"months_days":e=10,"month"===t.unit&&(n=!0),30===r&&(o=!0);break;case"week_days":e=8,"month"===t.unit&&(n=!0);break;case"days":e=1,"month"===t.unit&&(n=!0);break;case"hours":"day"===t.unit&&(n=!0);break;case"minutes":r%5!=0&&(o=!0);}if("minutes"===i.tickInterval||"hours"===i.tickInterval){if(!o)return !0}else if((r%e==0||n)&&!o)return !0}))}},{key:"recalcDimensionsBasedOnFormat",value:function(t,e){var i=this.w,a=this.formatDates(t),s=this.removeOverlappingTS(a);i.globals.timescaleLabels=s.slice(),new nt(this.ctx).plotCoords();}},{key:"determineInterval",value:function(t){switch(!0){case t>1825:this.tickInterval="years";break;case t>800&&t<=1825:this.tickInterval="half_year";break;case t>180&&t<=800:this.tickInterval="months";break;case t>90&&t<=180:this.tickInterval="months_fortnight";break;case t>60&&t<=90:this.tickInterval="months_days";break;case t>30&&t<=60:this.tickInterval="week_days";break;case t>2&&t<=30:this.tickInterval="days";break;case t>.1&&t<=2:this.tickInterval="hours";break;case t<.1:this.tickInterval="minutes";break;default:this.tickInterval="days";}}},{key:"generateYearScale",value:function(t){var e=t.firstVal,i=t.currentMonth,a=t.currentYear,s=t.daysWidthOnXAxis,r=t.numberOfYears,n=e.minYear,o=0,l=new Y(this.ctx);if(e.minDate>1||e.minMonth>0){var h=l.determineRemainingDaysOfYear(e.minYear,e.minMonth,e.minDate);o=(l.determineDaysOfYear(e.minYear)-h+1)*s,n=e.minYear+1,this.timeScaleArray.push({position:o,value:n,unit:"year",year:n,month:g.monthMod(i+1)});}else 1===e.minDate&&0===e.minMonth&&this.timeScaleArray.push({position:o,value:n,unit:"year",year:a,month:g.monthMod(i+1)});for(var c=n,d=o,u=0;u<r;u++)c++,d=l.determineDaysOfYear(c-1)*s+d,this.timeScaleArray.push({position:d,value:c,unit:"year",year:c,month:1});}},{key:"generateMonthScale",value:function(t){var e=t.firstVal,i=t.currentMonthDate,a=t.currentMonth,s=t.currentYear,r=t.daysWidthOnXAxis,n=t.numberOfMonths,o=a,l=0,h=new Y(this.ctx),c="month",d=0;if(e.minDate>1){l=(h.determineDaysOfMonths(a+1,e.minYear)-i+1)*r,o=g.monthMod(a+1);var u=s+d,f=g.monthMod(o),p=o;0===o&&(c="year",p=u,f=1,u+=d+=1),this.timeScaleArray.push({position:l,value:p,unit:c,year:u,month:f});}else this.timeScaleArray.push({position:l,value:o,unit:c,year:s,month:g.monthMod(a)});for(var x=o+1,b=l,m=0,v=1;m<n;m++,v++){0===(x=g.monthMod(x))?(c="year",d+=1):c="month";var y=this._getYear(s,x,d);b=h.determineDaysOfMonths(x,y)*r+b;var w=0===x?y:x;this.timeScaleArray.push({position:b,value:w,unit:c,year:y,month:0===x?1:x}),x++;}}},{key:"generateDayScale",value:function(t){var e=t.firstVal,i=t.currentMonth,a=t.currentYear,s=t.hoursWidthOnXAxis,r=t.numberOfDays,n=new Y(this.ctx),o="day",l=e.minDate+1,h=l,c=function(t,e,i){return t>n.determineDaysOfMonths(e+1,i)?(h=1,o="month",u=e+=1,e):e},d=(24-e.minHour)*s,u=l,f=c(h,i,a);0===e.minHour&&1===e.minDate&&(d=0,u=g.monthMod(e.minMonth),o="month",h=e.minDate,r++),this.timeScaleArray.push({position:d,value:u,unit:o,year:this._getYear(a,f,0),month:g.monthMod(f),day:h});for(var p=d,x=0;x<r;x++){o="day",f=c(h+=1,f,this._getYear(a,f,0));var b=this._getYear(a,f,0);p=24*s+p;var m=1===h?g.monthMod(f):h;this.timeScaleArray.push({position:p,value:m,unit:o,year:b,month:g.monthMod(f),day:m});}}},{key:"generateHourScale",value:function(t){var e=t.firstVal,i=t.currentDate,a=t.currentMonth,s=t.currentYear,r=t.minutesWidthOnXAxis,n=t.numberOfHours,o=new Y(this.ctx),l="hour",h=function(t,e){return t>o.determineDaysOfMonths(e+1,s)&&(x=1,e+=1),{month:e,date:x}},c=function(t,e){return t>o.determineDaysOfMonths(e+1,s)?e+=1:e},d=60-e.minMinute,u=d*r,f=e.minHour+1,p=f+1;60===d&&(u=0,p=(f=e.minHour)+1);var x=i,b=c(x,a);this.timeScaleArray.push({position:u,value:f,unit:l,day:x,hour:p,year:s,month:g.monthMod(b)});for(var m=u,v=0;v<n;v++){if(l="hour",p>=24)p=0,l="day",b=h(x+=1,b).month,b=c(x,b);var y=this._getYear(s,b,0);m=0===p&&0===v?d*r:60*r+m;var w=0===p?x:p;this.timeScaleArray.push({position:m,value:w,unit:l,hour:p,day:x,year:y,month:g.monthMod(b)}),p++;}}},{key:"generateMinuteScale",value:function(t){var e=t.firstVal,i=t.currentMinute,a=t.currentHour,s=t.currentDate,r=t.currentMonth,n=t.currentYear,o=t.minutesWidthOnXAxis,l=t.numberOfMinutes,h=o-(i-e.minMinute),c=e.minMinute+1,d=c+1,u=s,f=r,p=n,x=a;this.timeScaleArray.push({position:h,value:c,unit:"minute",day:u,hour:x,minute:d,year:p,month:g.monthMod(f)});for(var b=h,m=0;m<l;m++)d>=60&&(d=0,24===(x+=1)&&(x=0)),b=o+b,this.timeScaleArray.push({position:b,value:d,unit:"minute",hour:x,minute:d,day:u,year:this._getYear(n,f,0),month:g.monthMod(f)}),d++;}},{key:"createRawDateString",value:function(t,e){var i=t.year;return i+="-"+("0"+t.month.toString()).slice(-2),"day"===t.unit?i+="day"===t.unit?"-"+("0"+e).slice(-2):"-01":i+="-"+("0"+(t.day?t.day:"1")).slice(-2),"hour"===t.unit?i+="hour"===t.unit?"T"+("0"+e).slice(-2):"T00":i+="T"+("0"+(t.hour?t.hour:"0")).slice(-2),i+="minute"===t.unit?":"+("0"+e).slice(-2)+":00":":00:00",this.utc&&(i+=".000Z"),i}},{key:"formatDates",value:function(t){var e=this,i=this.w;return t.map((function(t){var a=t.value.toString(),s=new Y(e.ctx),r=e.createRawDateString(t,a),n=s.getDate(r);if(void 0===i.config.xaxis.labels.format){var o="dd MMM",l=i.config.xaxis.labels.datetimeFormatter;"year"===t.unit&&(o=l.year),"month"===t.unit&&(o=l.month),"day"===t.unit&&(o=l.day),"hour"===t.unit&&(o=l.hour),"minute"===t.unit&&(o=l.minute),a=s.formatDate(n,o);}else a=s.formatDate(n,i.config.xaxis.labels.format);return {dateString:r,position:t.position,value:a,unit:t.unit,year:t.year,month:t.month}}))}},{key:"removeOverlappingTS",value:function(t){var e,i=this,a=new p(this.ctx),s=!1;t.length>0&&t[0].value&&t.every((function(e){return e.value.length===t[0].value.length}))&&(s=!0,e=a.getTextRects(t[0].value).width);var r=0,n=t.map((function(n,o){if(o>0&&i.w.config.xaxis.labels.hideOverlappingLabels){var l=s?e:a.getTextRects(t[r].value).width,h=t[r].position;return n.position>h+l+10?(r=o,n):null}return n}));return n=n.filter((function(t){return null!==t}))}},{key:"_getYear",value:function(t,e,i){return t+Math.floor(e/12)+i}}]),t}(),Tt=function(){function t(i,a){e(this,t),this.ctx=a,this.w=a.w,this.el=i;}return a(t,[{key:"setupElements",value:function(){var t=this.w.globals,e=this.w.config,i=e.chart.type;t.axisCharts=["line","area","bar","rangeBar","candlestick","scatter","bubble","radar","heatmap"].indexOf(i)>-1,t.xyCharts=["line","area","bar","rangeBar","candlestick","scatter","bubble"].indexOf(i)>-1,t.isBarHorizontal=("bar"===e.chart.type||"rangeBar"===e.chart.type)&&e.plotOptions.bar.horizontal,t.chartClass=".apexcharts"+t.cuid,t.dom.baseEl=this.el,t.dom.elWrap=document.createElement("div"),p.setAttrs(t.dom.elWrap,{id:t.chartClass.substring(1),class:"apexcharts-canvas "+t.chartClass.substring(1)}),this.el.appendChild(t.dom.elWrap),t.dom.Paper=new window.SVG.Doc(t.dom.elWrap),t.dom.Paper.attr({class:"apexcharts-svg","xmlns:data":"ApexChartsNS",transform:"translate(".concat(e.chart.offsetX,", ").concat(e.chart.offsetY,")")}),t.dom.Paper.node.style.background=e.chart.background,this.setSVGDimensions(),t.dom.elGraphical=t.dom.Paper.group().attr({class:"apexcharts-inner apexcharts-graphical"}),t.dom.elAnnotations=t.dom.Paper.group().attr({class:"apexcharts-annotations"}),t.dom.elDefs=t.dom.Paper.defs(),t.dom.elLegendWrap=document.createElement("div"),t.dom.elLegendWrap.classList.add("apexcharts-legend"),t.dom.elWrap.appendChild(t.dom.elLegendWrap),t.dom.Paper.add(t.dom.elGraphical),t.dom.elGraphical.add(t.dom.elDefs);}},{key:"plotChartType",value:function(t,e){var i=this.w,a=i.config,s=i.globals,r={series:[],i:[]},n={series:[],i:[]},o={series:[],i:[]},l={series:[],i:[]},h={series:[],i:[]},c={series:[],i:[]};s.series.map((function(e,d){void 0!==t[d].type?("column"===t[d].type||"bar"===t[d].type?(s.series.length>1&&a.plotOptions.bar.horizontal&&console.warn("Horizontal bars are not supported in a mixed/combo chart. Please turn off `plotOptions.bar.horizontal`"),h.series.push(e),h.i.push(d),i.globals.columnSeries=h.series):"area"===t[d].type?(n.series.push(e),n.i.push(d)):"line"===t[d].type?(r.series.push(e),r.i.push(d)):"scatter"===t[d].type?(o.series.push(e),o.i.push(d)):"bubble"===t[d].type?(l.series.push(e),l.i.push(d)):"candlestick"===t[d].type?(c.series.push(e),c.i.push(d)):console.warn("You have specified an unrecognized chart type. Available types for this propery are line/area/column/bar/scatter/bubble"),s.comboCharts=!0):(r.series.push(e),r.i.push(d));}));var d=new Lt(this.ctx,e),g=new vt(this.ctx,e);this.ctx.pie=new kt(this.ctx);var u=new St(this.ctx),f=new F(this.ctx,e),p=new At(this.ctx),x=[];if(s.comboCharts){if(n.series.length>0&&x.push(d.draw(n.series,"area",n.i)),h.series.length>0)if(i.config.chart.stacked){var b=new mt(this.ctx,e);x.push(b.draw(h.series,h.i));}else {var m=new X(this.ctx,e);x.push(m.draw(h.series,h.i));}if(r.series.length>0&&x.push(d.draw(r.series,"line",r.i)),c.series.length>0&&x.push(g.draw(c.series,c.i)),o.series.length>0){var v=new Lt(this.ctx,e,!0);x.push(v.draw(o.series,"scatter",o.i));}if(l.series.length>0){var y=new Lt(this.ctx,e,!0);x.push(y.draw(l.series,"bubble",l.i));}}else switch(a.chart.type){case"line":x=d.draw(s.series,"line");break;case"area":x=d.draw(s.series,"area");break;case"bar":if(a.chart.stacked)x=new mt(this.ctx,e).draw(s.series);else x=new X(this.ctx,e).draw(s.series);break;case"candlestick":x=new vt(this.ctx,e).draw(s.series);break;case"rangeBar":x=f.draw(s.series);break;case"heatmap":x=new yt(this.ctx,e).draw(s.series);break;case"pie":case"donut":case"polarArea":x=this.ctx.pie.draw(s.series);break;case"radialBar":x=u.draw(s.series);break;case"radar":x=p.draw(s.series);break;default:x=d.draw(s.series);}return x}},{key:"setSVGDimensions",value:function(){var t=this.w.globals,e=this.w.config;t.svgWidth=e.chart.width,t.svgHeight=e.chart.height;var i=g.getDimensions(this.el),a=e.chart.width.toString().split(/[0-9]+/g).pop();if("%"===a?g.isNumber(i[0])&&(0===i[0].width&&(i=g.getDimensions(this.el.parentNode)),t.svgWidth=i[0]*parseInt(e.chart.width,10)/100):"px"!==a&&""!==a||(t.svgWidth=parseInt(e.chart.width,10)),"auto"!==t.svgHeight&&""!==t.svgHeight)if("%"===e.chart.height.toString().split(/[0-9]+/g).pop()){var s=g.getDimensions(this.el.parentNode);t.svgHeight=s[1]*parseInt(e.chart.height,10)/100;}else t.svgHeight=parseInt(e.chart.height,10);else t.axisCharts?t.svgHeight=t.svgWidth/1.61:t.svgHeight=t.svgWidth/1.2;t.svgWidth<0&&(t.svgWidth=0),t.svgHeight<0&&(t.svgHeight=0),p.setAttrs(t.dom.Paper.node,{width:t.svgWidth,height:t.svgHeight});var r=e.chart.sparkline.enabled?0:t.axisCharts?e.chart.parentHeightOffset:0;t.dom.Paper.node.parentNode.parentNode.style.minHeight=t.svgHeight+r+"px",t.dom.elWrap.style.width=t.svgWidth+"px",t.dom.elWrap.style.height=t.svgHeight+"px";}},{key:"shiftGraphPosition",value:function(){var t=this.w.globals,e=t.translateY,i={transform:"translate("+t.translateX+", "+e+")"};p.setAttrs(t.dom.elGraphical.node,i);}},{key:"resizeNonAxisCharts",value:function(){var t=this.w,e=t.globals,i=0,a=t.config.chart.sparkline.enabled?1:15;a+=t.config.grid.padding.bottom,"top"!==t.config.legend.position&&"bottom"!==t.config.legend.position||!t.config.legend.show||t.config.legend.floating||(i=new lt(this.ctx).legendHelpers.getLegendBBox().clwh+10);var s=t.globals.dom.baseEl.querySelector(".apexcharts-radialbar"),r=2.05*t.globals.radialSize;if(s&&!t.config.chart.sparkline.enabled){var n=g.getBoundingClientRect(s);r=n.bottom;var o=n.bottom-n.top;r=Math.max(2.05*t.globals.radialSize,o);}var l=r+e.translateY+i+a;e.dom.elLegendForeign&&e.dom.elLegendForeign.setAttribute("height",l),e.dom.elWrap.style.height=l+"px",p.setAttrs(e.dom.Paper.node,{height:l}),e.dom.Paper.node.parentNode.parentNode.style.minHeight=l+"px";}},{key:"coreCalculations",value:function(){new U(this.ctx).init();}},{key:"resetGlobals",value:function(){var t=this,e=function(){return t.w.config.series.map((function(t){return []}))},i=new H,a=this.w.globals;i.initGlobalVars(a),a.seriesXvalues=e(),a.seriesYvalues=e();}},{key:"isMultipleY",value:function(){if(this.w.config.yaxis.constructor===Array&&this.w.config.yaxis.length>1)return this.w.globals.isMultipleYAxis=!0,!0}},{key:"xySettings",value:function(){var t=null,e=this.w;if(e.globals.axisCharts){if("back"===e.config.xaxis.crosshairs.position)new Q(this.ctx).drawXCrosshairs();if("back"===e.config.yaxis[0].crosshairs.position)new Q(this.ctx).drawYCrosshairs();if("datetime"===e.config.xaxis.type&&void 0===e.config.xaxis.labels.formatter){var i=new Pt(this.ctx),a=[];isFinite(e.globals.minX)&&isFinite(e.globals.maxX)&&!e.globals.isBarHorizontal?a=i.calculateTimeScaleTicks(e.globals.minX,e.globals.maxX):e.globals.isBarHorizontal&&(a=i.calculateTimeScaleTicks(e.globals.minY,e.globals.maxY)),i.recalcDimensionsBasedOnFormat(a);}t=new m(this.ctx).getCalculatedRatios();}return t}},{key:"updateSourceChart",value:function(t){this.ctx.w.globals.selection=void 0,this.ctx.updateHelpers._updateOptions({chart:{selection:{xaxis:{min:t.w.globals.minX,max:t.w.globals.maxX}}}},!1,!1);}},{key:"setupBrushHandler",value:function(){var t=this,e=this.w;if(e.config.chart.brush.enabled&&"function"!=typeof e.config.chart.events.selection){var i=e.config.chart.brush.targets||[e.config.chart.brush.target];i.forEach((function(e){var i=ApexCharts.getChartByID(e);i.w.globals.brushSource=t.ctx,"function"!=typeof i.w.config.chart.events.zoomed&&(i.w.config.chart.events.zoomed=function(){t.updateSourceChart(i);}),"function"!=typeof i.w.config.chart.events.scrolled&&(i.w.config.chart.events.scrolled=function(){t.updateSourceChart(i);});})),e.config.chart.events.selection=function(t,a){i.forEach((function(t){var i=ApexCharts.getChartByID(t),s=g.clone(e.config.yaxis);if(e.config.chart.brush.autoScaleYaxis&&1===i.w.globals.series.length){var r=new j(i);s=r.autoScaleY(i,s,a);}var o=i.w.config.yaxis.reduce((function(t,e,a){return [].concat(d(t),[n({},i.w.config.yaxis[a],{min:s[0].min,max:s[0].max})])}),[]);i.ctx.updateHelpers._updateOptions({xaxis:{min:a.xaxis.min,max:a.xaxis.max},yaxis:o},!1,!1,!1,!1);}));};}}}]),t}(),zt=function(){function i(t){e(this,i),this.ctx=t,this.w=t.w;}return a(i,[{key:"_updateOptions",value:function(e){var i=this,a=arguments.length>1&&void 0!==arguments[1]&&arguments[1],s=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],n=arguments.length>4&&void 0!==arguments[4]&&arguments[4],o=[this.ctx];r&&(o=this.ctx.getSyncedCharts()),this.ctx.w.globals.isExecCalled&&(o=[this.ctx],this.ctx.w.globals.isExecCalled=!1),o.forEach((function(r){var o=r.w;return o.globals.shouldAnimate=s,a||(o.globals.resized=!0,o.globals.dataChanged=!0,s&&r.series.getPreviousPaths()),e&&"object"===t(e)&&(r.config=new D(e),e=m.extendArrayProps(r.config,e,o),r.w.globals.chartID!==i.ctx.w.globals.chartID&&delete e.series,o.config=g.extend(o.config,e),n&&(o.globals.lastXAxis=[],o.globals.lastYAxis=[],o.globals.initialConfig=g.extend({},o.config),o.globals.initialSeries=JSON.parse(JSON.stringify(o.config.series)))),r.update(e)}));}},{key:"_updateSeries",value:function(t,e){var i,a=this,s=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=this.w;return r.globals.shouldAnimate=e,r.globals.dataChanged=!0,e&&this.ctx.series.getPreviousPaths(),r.globals.axisCharts?(0===(i=t.map((function(t,e){return a._extendSeries(t,e)}))).length&&(i=[{data:[]}]),r.config.series=i):r.config.series=t.slice(),s&&(r.globals.initialConfig.series=JSON.parse(JSON.stringify(r.config.series)),r.globals.initialSeries=JSON.parse(JSON.stringify(r.config.series))),this.ctx.update()}},{key:"_extendSeries",value:function(t,e){var i=this.w;return n({},i.config.series[e],{name:t.name?t.name:i.config.series[e]&&i.config.series[e].name,type:t.type?t.type:i.config.series[e]&&i.config.series[e].type,data:t.data?t.data:i.config.series[e]&&i.config.series[e].data})}},{key:"toggleDataPointSelection",value:function(t,e){var i=this.w,a=null,s=".apexcharts-series[data\\:realIndex='".concat(t,"']");return i.globals.axisCharts?a=i.globals.dom.Paper.select("".concat(s," path[j='").concat(e,"'], ").concat(s," circle[j='").concat(e,"'], ").concat(s," rect[j='").concat(e,"']")).members[0]:void 0===e&&(a=i.globals.dom.Paper.select("".concat(s," path[j='").concat(t,"']")).members[0],"pie"!==i.config.chart.type&&"polarArea"!==i.config.chart.type&&"donut"!==i.config.chart.type||this.ctx.pie.pieClicked(t)),a?(new p(this.ctx).pathMouseDown(a,null),a.node?a.node:null):(console.warn("toggleDataPointSelection: Element not found"),null)}},{key:"forceXAxisUpdate",value:function(t){var e=this.w;if(["min","max"].forEach((function(i){void 0!==t.xaxis[i]&&(e.config.xaxis[i]=t.xaxis[i],e.globals.lastXAxis[i]=t.xaxis[i]);})),t.xaxis.categories&&t.xaxis.categories.length&&(e.config.xaxis.categories=t.xaxis.categories),e.config.xaxis.convertedCatToNumeric){var i=new R(t);t=i.convertCatToNumericXaxis(t,this.ctx);}return t}},{key:"forceYAxisUpdate",value:function(t){var e=this.w;return e.config.chart.stacked&&"100%"===e.config.chart.stackType&&(Array.isArray(t.yaxis)?t.yaxis.forEach((function(e,i){t.yaxis[i].min=0,t.yaxis[i].max=100;})):(t.yaxis.min=0,t.yaxis.max=100)),t}},{key:"revertDefaultAxisMinMax",value:function(){var t=this,e=this.w;e.config.xaxis.min=e.globals.lastXAxis.min,e.config.xaxis.max=e.globals.lastXAxis.max,e.config.yaxis.map((function(i,a){e.globals.zoomed?void 0!==e.globals.lastYAxis[a]&&(i.min=e.globals.lastYAxis[a].min,i.max=e.globals.lastYAxis[a].max):void 0!==t.ctx.opts.yaxis[a]&&(i.min=t.ctx.opts.yaxis[a].min,i.max=t.ctx.opts.yaxis[a].max);}));}}]),i}();w="undefined"!=typeof window?window:void 0,k=function(e,i){var a=(void 0!==this?this:e).SVG=function(t){if(a.supported)return t=new a.Doc(t),a.parser.draw||a.prepare(),t};if(a.ns="http://www.w3.org/2000/svg",a.xmlns="http://www.w3.org/2000/xmlns/",a.xlink="http://www.w3.org/1999/xlink",a.svgjs="http://svgjs.com/svgjs",a.supported=!0,!a.supported)return !1;a.did=1e3,a.eid=function(t){return "Svgjs"+d(t)+a.did++},a.create=function(t){var e=i.createElementNS(this.ns,t);return e.setAttribute("id",this.eid(t)),e},a.extend=function(){var t,e;e=(t=[].slice.call(arguments)).pop();for(var i=t.length-1;i>=0;i--)if(t[i])for(var s in e)t[i].prototype[s]=e[s];a.Set&&a.Set.inherit&&a.Set.inherit();},a.invent=function(t){var e="function"==typeof t.create?t.create:function(){this.constructor.call(this,a.create(t.create));};return t.inherit&&(e.prototype=new t.inherit),t.extend&&a.extend(e,t.extend),t.construct&&a.extend(t.parent||a.Container,t.construct),e},a.adopt=function(t){return t?t.instance?t.instance:((i="svg"==t.nodeName?t.parentNode instanceof e.SVGElement?new a.Nested:new a.Doc:"linearGradient"==t.nodeName?new a.Gradient("linear"):"radialGradient"==t.nodeName?new a.Gradient("radial"):a[d(t.nodeName)]?new(a[d(t.nodeName)]):new a.Element(t)).type=t.nodeName,i.node=t,t.instance=i,i instanceof a.Doc&&i.namespace().defs(),i.setData(JSON.parse(t.getAttribute("svgjs:data"))||{}),i):null;var i;},a.prepare=function(){var t=i.getElementsByTagName("body")[0],e=(t?new a.Doc(t):a.adopt(i.documentElement).nested()).size(2,0);a.parser={body:t||i.documentElement,draw:e.style("opacity:0;position:absolute;left:-100%;top:-100%;overflow:hidden").node,poly:e.polyline().node,path:e.path().node,native:a.create("svg")};},a.parser={native:a.create("svg")},i.addEventListener("DOMContentLoaded",(function(){a.parser.draw||a.prepare();}),!1),a.regex={numberAndUnit:/^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i,hex:/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,rgb:/rgb\((\d+),(\d+),(\d+)\)/,reference:/#([a-z0-9\-_]+)/i,transforms:/\)\s*,?\s*/,whitespace:/\s/g,isHex:/^#[a-f0-9]{3,6}$/i,isRgb:/^rgb\(/,isCss:/[^:]+:[^;]+;?/,isBlank:/^(\s+)?$/,isNumber:/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,isPercent:/^-?[\d\.]+%$/,isImage:/\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i,delimiter:/[\s,]+/,hyphen:/([^e])\-/gi,pathLetters:/[MLHVCSQTAZ]/gi,isPathLetter:/[MLHVCSQTAZ]/i,numbersWithDots:/((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi,dots:/\./g},a.utils={map:function(t,e){for(var i=t.length,a=[],s=0;s<i;s++)a.push(e(t[s]));return a},filter:function(t,e){for(var i=t.length,a=[],s=0;s<i;s++)e(t[s])&&a.push(t[s]);return a},filterSVGElements:function(t){return this.filter(t,(function(t){return t instanceof e.SVGElement}))}},a.defaults={attrs:{"fill-opacity":1,"stroke-opacity":1,"stroke-width":0,"stroke-linejoin":"miter","stroke-linecap":"butt",fill:"#000000",stroke:"#000000",opacity:1,x:0,y:0,cx:0,cy:0,width:0,height:0,r:0,rx:0,ry:0,offset:0,"stop-opacity":1,"stop-color":"#000000","font-size":16,"font-family":"Helvetica, Arial, sans-serif","text-anchor":"start"}},a.Color=function(e){var i,s;this.r=0,this.g=0,this.b=0,e&&("string"==typeof e?a.regex.isRgb.test(e)?(i=a.regex.rgb.exec(e.replace(a.regex.whitespace,"")),this.r=parseInt(i[1]),this.g=parseInt(i[2]),this.b=parseInt(i[3])):a.regex.isHex.test(e)&&(i=a.regex.hex.exec(4==(s=e).length?["#",s.substring(1,2),s.substring(1,2),s.substring(2,3),s.substring(2,3),s.substring(3,4),s.substring(3,4)].join(""):s),this.r=parseInt(i[1],16),this.g=parseInt(i[2],16),this.b=parseInt(i[3],16)):"object"===t(e)&&(this.r=e.r,this.g=e.g,this.b=e.b));},a.extend(a.Color,{toString:function(){return this.toHex()},toHex:function(){return "#"+g(this.r)+g(this.g)+g(this.b)},toRgb:function(){return "rgb("+[this.r,this.g,this.b].join()+")"},brightness:function(){return this.r/255*.3+this.g/255*.59+this.b/255*.11},morph:function(t){return this.destination=new a.Color(t),this},at:function(t){return this.destination?(t=t<0?0:t>1?1:t,new a.Color({r:~~(this.r+(this.destination.r-this.r)*t),g:~~(this.g+(this.destination.g-this.g)*t),b:~~(this.b+(this.destination.b-this.b)*t)})):this}}),a.Color.test=function(t){return t+="",a.regex.isHex.test(t)||a.regex.isRgb.test(t)},a.Color.isRgb=function(t){return t&&"number"==typeof t.r&&"number"==typeof t.g&&"number"==typeof t.b},a.Color.isColor=function(t){return a.Color.isRgb(t)||a.Color.test(t)},a.Array=function(t,e){0==(t=(t||[]).valueOf()).length&&e&&(t=e.valueOf()),this.value=this.parse(t);},a.extend(a.Array,{toString:function(){return this.value.join(" ")},valueOf:function(){return this.value},parse:function(t){return t=t.valueOf(),Array.isArray(t)?t:this.split(t)}}),a.PointArray=function(t,e){a.Array.call(this,t,e||[[0,0]]);},a.PointArray.prototype=new a.Array,a.PointArray.prototype.constructor=a.PointArray;for(var s={M:function(t,e,i){return e.x=i.x=t[0],e.y=i.y=t[1],["M",e.x,e.y]},L:function(t,e){return e.x=t[0],e.y=t[1],["L",t[0],t[1]]},H:function(t,e){return e.x=t[0],["H",t[0]]},V:function(t,e){return e.y=t[0],["V",t[0]]},C:function(t,e){return e.x=t[4],e.y=t[5],["C",t[0],t[1],t[2],t[3],t[4],t[5]]},Q:function(t,e){return e.x=t[2],e.y=t[3],["Q",t[0],t[1],t[2],t[3]]},Z:function(t,e,i){return e.x=i.x,e.y=i.y,["Z"]}},r="mlhvqtcsaz".split(""),n=0,o=r.length;n<o;++n)s[r[n]]=function(t){return function(e,i,a){if("H"==t)e[0]=e[0]+i.x;else if("V"==t)e[0]=e[0]+i.y;else if("A"==t)e[5]=e[5]+i.x,e[6]=e[6]+i.y;else for(var r=0,n=e.length;r<n;++r)e[r]=e[r]+(r%2?i.y:i.x);return s[t](e,i,a)}}(r[n].toUpperCase());a.PathArray=function(t,e){a.Array.call(this,t,e||[["M",0,0]]);},a.PathArray.prototype=new a.Array,a.PathArray.prototype.constructor=a.PathArray,a.extend(a.PathArray,{toString:function(){return function(t){for(var e=0,i=t.length,a="";e<i;e++)a+=t[e][0],null!=t[e][1]&&(a+=t[e][1],null!=t[e][2]&&(a+=" ",a+=t[e][2],null!=t[e][3]&&(a+=" ",a+=t[e][3],a+=" ",a+=t[e][4],null!=t[e][5]&&(a+=" ",a+=t[e][5],a+=" ",a+=t[e][6],null!=t[e][7]&&(a+=" ",a+=t[e][7])))));return a+" "}(this.value)},move:function(t,e){var i=this.bbox();return i.x,i.y,this},at:function(t){if(!this.destination)return this;for(var e=this.value,i=this.destination.value,s=[],r=new a.PathArray,n=0,o=e.length;n<o;n++){s[n]=[e[n][0]];for(var l=1,h=e[n].length;l<h;l++)s[n][l]=e[n][l]+(i[n][l]-e[n][l])*t;"A"===s[n][0]&&(s[n][4]=+(0!=s[n][4]),s[n][5]=+(0!=s[n][5]));}return r.value=s,r},parse:function(t){if(t instanceof a.PathArray)return t.valueOf();var e,i={M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,A:7,Z:0};t="string"==typeof t?t.replace(a.regex.numbersWithDots,h).replace(a.regex.pathLetters," $& ").replace(a.regex.hyphen,"$1 -").trim().split(a.regex.delimiter):t.reduce((function(t,e){return [].concat.call(t,e)}),[]);var r=[],n=new a.Point,o=new a.Point,l=0,c=t.length;do{a.regex.isPathLetter.test(t[l])?(e=t[l],++l):"M"==e?e="L":"m"==e&&(e="l"),r.push(s[e].call(null,t.slice(l,l+=i[e.toUpperCase()]).map(parseFloat),n,o));}while(c>l);return r},bbox:function(){return a.parser.draw||a.prepare(),a.parser.path.setAttribute("d",this.toString()),a.parser.path.getBBox()}}),a.Number=a.invent({create:function(t,e){this.value=0,this.unit=e||"","number"==typeof t?this.value=isNaN(t)?0:isFinite(t)?t:t<0?-34e37:34e37:"string"==typeof t?(e=t.match(a.regex.numberAndUnit))&&(this.value=parseFloat(e[1]),"%"==e[5]?this.value/=100:"s"==e[5]&&(this.value*=1e3),this.unit=e[5]):t instanceof a.Number&&(this.value=t.valueOf(),this.unit=t.unit);},extend:{toString:function(){return ("%"==this.unit?~~(1e8*this.value)/1e6:"s"==this.unit?this.value/1e3:this.value)+this.unit},toJSON:function(){return this.toString()},valueOf:function(){return this.value},plus:function(t){return t=new a.Number(t),new a.Number(this+t,this.unit||t.unit)},minus:function(t){return t=new a.Number(t),new a.Number(this-t,this.unit||t.unit)},times:function(t){return t=new a.Number(t),new a.Number(this*t,this.unit||t.unit)},divide:function(t){return t=new a.Number(t),new a.Number(this/t,this.unit||t.unit)},to:function(t){var e=new a.Number(this);return "string"==typeof t&&(e.unit=t),e},morph:function(t){return this.destination=new a.Number(t),t.relative&&(this.destination.value+=this.value),this},at:function(t){return this.destination?new a.Number(this.destination).minus(this).times(t).plus(this):this}}}),a.Element=a.invent({create:function(t){this._stroke=a.defaults.attrs.stroke,this._event=null,this.dom={},(this.node=t)&&(this.type=t.nodeName,this.node.instance=this,this._stroke=t.getAttribute("stroke")||this._stroke);},extend:{x:function(t){return this.attr("x",t)},y:function(t){return this.attr("y",t)},cx:function(t){return null==t?this.x()+this.width()/2:this.x(t-this.width()/2)},cy:function(t){return null==t?this.y()+this.height()/2:this.y(t-this.height()/2)},move:function(t,e){return this.x(t).y(e)},center:function(t,e){return this.cx(t).cy(e)},width:function(t){return this.attr("width",t)},height:function(t){return this.attr("height",t)},size:function(t,e){var i=u(this,t,e);return this.width(new a.Number(i.width)).height(new a.Number(i.height))},clone:function(t){this.writeDataToDom();var e=x(this.node.cloneNode(!0));return t?t.add(e):this.after(e),e},remove:function(){return this.parent()&&this.parent().removeElement(this),this},replace:function(t){return this.after(t).remove(),t},addTo:function(t){return t.put(this)},putIn:function(t){return t.add(this)},id:function(t){return this.attr("id",t)},show:function(){return this.style("display","")},hide:function(){return this.style("display","none")},visible:function(){return "none"!=this.style("display")},toString:function(){return this.attr("id")},classes:function(){var t=this.attr("class");return null==t?[]:t.trim().split(a.regex.delimiter)},hasClass:function(t){return -1!=this.classes().indexOf(t)},addClass:function(t){if(!this.hasClass(t)){var e=this.classes();e.push(t),this.attr("class",e.join(" "));}return this},removeClass:function(t){return this.hasClass(t)&&this.attr("class",this.classes().filter((function(e){return e!=t})).join(" ")),this},toggleClass:function(t){return this.hasClass(t)?this.removeClass(t):this.addClass(t)},reference:function(t){return a.get(this.attr(t))},parent:function(t){var i=this;if(!i.node.parentNode)return null;if(i=a.adopt(i.node.parentNode),!t)return i;for(;i&&i.node instanceof e.SVGElement;){if("string"==typeof t?i.matches(t):i instanceof t)return i;if(!i.node.parentNode||"#document"==i.node.parentNode.nodeName)return null;i=a.adopt(i.node.parentNode);}},doc:function(){return this instanceof a.Doc?this:this.parent(a.Doc)},parents:function(t){var e=[],i=this;do{if(!(i=i.parent(t))||!i.node)break;e.push(i);}while(i.parent);return e},matches:function(t){return function(t,e){return (t.matches||t.matchesSelector||t.msMatchesSelector||t.mozMatchesSelector||t.webkitMatchesSelector||t.oMatchesSelector).call(t,e)}(this.node,t)},native:function(){return this.node},svg:function(t){var e=i.createElement("svg");if(!(t&&this instanceof a.Parent))return e.appendChild(t=i.createElement("svg")),this.writeDataToDom(),t.appendChild(this.node.cloneNode(!0)),e.innerHTML.replace(/^<svg>/,"").replace(/<\/svg>$/,"");e.innerHTML="<svg>"+t.replace(/\n/,"").replace(/<([\w:-]+)([^<]+?)\/>/g,"<$1$2></$1>")+"</svg>";for(var s=0,r=e.firstChild.childNodes.length;s<r;s++)this.node.appendChild(e.firstChild.firstChild);return this},writeDataToDom:function(){return (this.each||this.lines)&&(this.each?this:this.lines()).each((function(){this.writeDataToDom();})),this.node.removeAttribute("svgjs:data"),Object.keys(this.dom).length&&this.node.setAttribute("svgjs:data",JSON.stringify(this.dom)),this},setData:function(t){return this.dom=t,this},is:function(t){return function(t,e){return t instanceof e}(this,t)}}}),a.easing={"-":function(t){return t},"<>":function(t){return -Math.cos(t*Math.PI)/2+.5},">":function(t){return Math.sin(t*Math.PI/2)},"<":function(t){return 1-Math.cos(t*Math.PI/2)}},a.morph=function(t){return function(e,i){return new a.MorphObj(e,i).at(t)}},a.Situation=a.invent({create:function(t){this.init=!1,this.reversed=!1,this.reversing=!1,this.duration=new a.Number(t.duration).valueOf(),this.delay=new a.Number(t.delay).valueOf(),this.start=+new Date+this.delay,this.finish=this.start+this.duration,this.ease=t.ease,this.loop=0,this.loops=!1,this.animations={},this.attrs={},this.styles={},this.transforms=[],this.once={};}}),a.FX=a.invent({create:function(t){this._target=t,this.situations=[],this.active=!1,this.situation=null,this.paused=!1,this.lastPos=0,this.pos=0,this.absPos=0,this._speed=1;},extend:{animate:function(e,i,s){"object"===t(e)&&(i=e.ease,s=e.delay,e=e.duration);var r=new a.Situation({duration:e||1e3,delay:s||0,ease:a.easing[i||"-"]||i});return this.queue(r),this},target:function(t){return t&&t instanceof a.Element?(this._target=t,this):this._target},timeToAbsPos:function(t){return (t-this.situation.start)/(this.situation.duration/this._speed)},absPosToTime:function(t){return this.situation.duration/this._speed*t+this.situation.start},startAnimFrame:function(){this.stopAnimFrame(),this.animationFrame=e.requestAnimationFrame(function(){this.step();}.bind(this));},stopAnimFrame:function(){e.cancelAnimationFrame(this.animationFrame);},start:function(){return !this.active&&this.situation&&(this.active=!0,this.startCurrent()),this},startCurrent:function(){return this.situation.start=+new Date+this.situation.delay/this._speed,this.situation.finish=this.situation.start+this.situation.duration/this._speed,this.initAnimations().step()},queue:function(t){return ("function"==typeof t||t instanceof a.Situation)&&this.situations.push(t),this.situation||(this.situation=this.situations.shift()),this},dequeue:function(){return this.stop(),this.situation=this.situations.shift(),this.situation&&(this.situation instanceof a.Situation?this.start():this.situation.call(this)),this},initAnimations:function(){var t,e=this.situation;if(e.init)return this;for(var i in e.animations){t=this.target()[i](),Array.isArray(t)||(t=[t]),Array.isArray(e.animations[i])||(e.animations[i]=[e.animations[i]]);for(var s=t.length;s--;)e.animations[i][s]instanceof a.Number&&(t[s]=new a.Number(t[s])),e.animations[i][s]=t[s].morph(e.animations[i][s]);}for(var i in e.attrs)e.attrs[i]=new a.MorphObj(this.target().attr(i),e.attrs[i]);for(var i in e.styles)e.styles[i]=new a.MorphObj(this.target().style(i),e.styles[i]);return e.initialTransformation=this.target().matrixify(),e.init=!0,this},clearQueue:function(){return this.situations=[],this},clearCurrent:function(){return this.situation=null,this},stop:function(t,e){var i=this.active;return this.active=!1,e&&this.clearQueue(),t&&this.situation&&(!i&&this.startCurrent(),this.atEnd()),this.stopAnimFrame(),this.clearCurrent()},after:function(t){var e=this.last();return this.target().on("finished.fx",(function i(a){a.detail.situation==e&&(t.call(this,e),this.off("finished.fx",i));})),this._callStart()},during:function(t){var e=this.last(),i=function(i){i.detail.situation==e&&t.call(this,i.detail.pos,a.morph(i.detail.pos),i.detail.eased,e);};return this.target().off("during.fx",i).on("during.fx",i),this.after((function(){this.off("during.fx",i);})),this._callStart()},afterAll:function(t){var e=function e(i){t.call(this),this.off("allfinished.fx",e);};return this.target().off("allfinished.fx",e).on("allfinished.fx",e),this._callStart()},last:function(){return this.situations.length?this.situations[this.situations.length-1]:this.situation},add:function(t,e,i){return this.last()[i||"animations"][t]=e,this._callStart()},step:function(t){var e,i,a;t||(this.absPos=this.timeToAbsPos(+new Date)),!1!==this.situation.loops?(e=Math.max(this.absPos,0),i=Math.floor(e),!0===this.situation.loops||i<this.situation.loops?(this.pos=e-i,a=this.situation.loop,this.situation.loop=i):(this.absPos=this.situation.loops,this.pos=1,a=this.situation.loop-1,this.situation.loop=this.situation.loops),this.situation.reversing&&(this.situation.reversed=this.situation.reversed!=Boolean((this.situation.loop-a)%2))):(this.absPos=Math.min(this.absPos,1),this.pos=this.absPos),this.pos<0&&(this.pos=0),this.situation.reversed&&(this.pos=1-this.pos);var s=this.situation.ease(this.pos);for(var r in this.situation.once)r>this.lastPos&&r<=s&&(this.situation.once[r].call(this.target(),this.pos,s),delete this.situation.once[r]);return this.active&&this.target().fire("during",{pos:this.pos,eased:s,fx:this,situation:this.situation}),this.situation?(this.eachAt(),1==this.pos&&!this.situation.reversed||this.situation.reversed&&0==this.pos?(this.stopAnimFrame(),this.target().fire("finished",{fx:this,situation:this.situation}),this.situations.length||(this.target().fire("allfinished"),this.situations.length||(this.target().off(".fx"),this.active=!1)),this.active?this.dequeue():this.clearCurrent()):!this.paused&&this.active&&this.startAnimFrame(),this.lastPos=s,this):this},eachAt:function(){var t,e=this,i=this.target(),s=this.situation;for(var r in s.animations)t=[].concat(s.animations[r]).map((function(t){return "string"!=typeof t&&t.at?t.at(s.ease(e.pos),e.pos):t})),i[r].apply(i,t);for(var r in s.attrs)t=[r].concat(s.attrs[r]).map((function(t){return "string"!=typeof t&&t.at?t.at(s.ease(e.pos),e.pos):t})),i.attr.apply(i,t);for(var r in s.styles)t=[r].concat(s.styles[r]).map((function(t){return "string"!=typeof t&&t.at?t.at(s.ease(e.pos),e.pos):t})),i.style.apply(i,t);if(s.transforms.length){t=s.initialTransformation,r=0;for(var n=s.transforms.length;r<n;r++){var o=s.transforms[r];o instanceof a.Matrix?t=o.relative?t.multiply((new a.Matrix).morph(o).at(s.ease(this.pos))):t.morph(o).at(s.ease(this.pos)):(o.relative||o.undo(t.extract()),t=t.multiply(o.at(s.ease(this.pos))));}i.matrix(t);}return this},once:function(t,e,i){var a=this.last();return i||(t=a.ease(t)),a.once[t]=e,this},_callStart:function(){return setTimeout(function(){this.start();}.bind(this),0),this}},parent:a.Element,construct:{animate:function(t,e,i){return (this.fx||(this.fx=new a.FX(this))).animate(t,e,i)},delay:function(t){return (this.fx||(this.fx=new a.FX(this))).delay(t)},stop:function(t,e){return this.fx&&this.fx.stop(t,e),this},finish:function(){return this.fx&&this.fx.finish(),this}}}),a.MorphObj=a.invent({create:function(t,e){return a.Color.isColor(e)?new a.Color(t).morph(e):a.regex.delimiter.test(t)?a.regex.pathLetters.test(t)?new a.PathArray(t).morph(e):new a.Array(t).morph(e):a.regex.numberAndUnit.test(e)?new a.Number(t).morph(e):(this.value=t,void(this.destination=e))},extend:{at:function(t,e){return e<1?this.value:this.destination},valueOf:function(){return this.value}}}),a.extend(a.FX,{attr:function(e,i,a){if("object"===t(e))for(var s in e)this.attr(s,e[s]);else this.add(e,i,"attrs");return this},plot:function(t,e,i,a){return 4==arguments.length?this.plot([t,e,i,a]):this.add("plot",new(this.target().morphArray)(t))}}),a.Box=a.invent({create:function(e,i,s,r){if(!("object"!==t(e)||e instanceof a.Element))return a.Box.call(this,null!=e.left?e.left:e.x,null!=e.top?e.top:e.y,e.width,e.height);4==arguments.length&&(this.x=e,this.y=i,this.width=s,this.height=r),b(this);}}),a.BBox=a.invent({create:function(t){if(a.Box.apply(this,[].slice.call(arguments)),t instanceof a.Element){var e;try{if(!i.documentElement.contains){for(var s=t.node;s.parentNode;)s=s.parentNode;if(s!=i)throw new Error("Element not in the dom")}e=t.node.getBBox();}catch(i){if(t instanceof a.Shape){a.parser.draw||a.prepare();var r=t.clone(a.parser.draw.instance).show();e=r.node.getBBox(),r.remove();}else e={x:t.node.clientLeft,y:t.node.clientTop,width:t.node.clientWidth,height:t.node.clientHeight};}a.Box.call(this,e);}},inherit:a.Box,parent:a.Element,construct:{bbox:function(){return new a.BBox(this)}}}),a.BBox.prototype.constructor=a.BBox,a.Matrix=a.invent({create:function(e){var i=p([1,0,0,1,0,0]);e=e instanceof a.Element?e.matrixify():"string"==typeof e?p(e.split(a.regex.delimiter).map(parseFloat)):6==arguments.length?p([].slice.call(arguments)):Array.isArray(e)?p(e):"object"===t(e)?e:i;for(var s=v.length-1;s>=0;--s)this[v[s]]=null!=e[v[s]]?e[v[s]]:i[v[s]];},extend:{extract:function(){var t=f(this,0,1),e=(f(this,1,0),180/Math.PI*Math.atan2(t.y,t.x)-90);return {x:this.e,y:this.f,transformedX:(this.e*Math.cos(e*Math.PI/180)+this.f*Math.sin(e*Math.PI/180))/Math.sqrt(this.a*this.a+this.b*this.b),transformedY:(this.f*Math.cos(e*Math.PI/180)+this.e*Math.sin(-e*Math.PI/180))/Math.sqrt(this.c*this.c+this.d*this.d),rotation:e,a:this.a,b:this.b,c:this.c,d:this.d,e:this.e,f:this.f,matrix:new a.Matrix(this)}},clone:function(){return new a.Matrix(this)},morph:function(t){return this.destination=new a.Matrix(t),this},multiply:function(t){return new a.Matrix(this.native().multiply(function(t){return t instanceof a.Matrix||(t=new a.Matrix(t)),t}(t).native()))},inverse:function(){return new a.Matrix(this.native().inverse())},translate:function(t,e){return new a.Matrix(this.native().translate(t||0,e||0))},native:function(){for(var t=a.parser.native.createSVGMatrix(),e=v.length-1;e>=0;e--)t[v[e]]=this[v[e]];return t},toString:function(){return "matrix("+m(this.a)+","+m(this.b)+","+m(this.c)+","+m(this.d)+","+m(this.e)+","+m(this.f)+")"}},parent:a.Element,construct:{ctm:function(){return new a.Matrix(this.node.getCTM())},screenCTM:function(){if(this instanceof a.Nested){var t=this.rect(1,1),e=t.node.getScreenCTM();return t.remove(),new a.Matrix(e)}return new a.Matrix(this.node.getScreenCTM())}}}),a.Point=a.invent({create:function(e,i){var a;a=Array.isArray(e)?{x:e[0],y:e[1]}:"object"===t(e)?{x:e.x,y:e.y}:null!=e?{x:e,y:null!=i?i:e}:{x:0,y:0},this.x=a.x,this.y=a.y;},extend:{clone:function(){return new a.Point(this)},morph:function(t,e){return this.destination=new a.Point(t,e),this}}}),a.extend(a.Element,{point:function(t,e){return new a.Point(t,e).transform(this.screenCTM().inverse())}}),a.extend(a.Element,{attr:function(e,i,s){if(null==e){for(e={},s=(i=this.node.attributes).length-1;s>=0;s--)e[i[s].nodeName]=a.regex.isNumber.test(i[s].nodeValue)?parseFloat(i[s].nodeValue):i[s].nodeValue;return e}if("object"===t(e))for(var r in e)this.attr(r,e[r]);else if(null===i)this.node.removeAttribute(e);else {if(null==i)return null==(i=this.node.getAttribute(e))?a.defaults.attrs[e]:a.regex.isNumber.test(i)?parseFloat(i):i;"stroke-width"==e?this.attr("stroke",parseFloat(i)>0?this._stroke:null):"stroke"==e&&(this._stroke=i),"fill"!=e&&"stroke"!=e||(a.regex.isImage.test(i)&&(i=this.doc().defs().image(i,0,0)),i instanceof a.Image&&(i=this.doc().defs().pattern(0,0,(function(){this.add(i);})))),"number"==typeof i?i=new a.Number(i):a.Color.isColor(i)?i=new a.Color(i):Array.isArray(i)&&(i=new a.Array(i)),"leading"==e?this.leading&&this.leading(i):"string"==typeof s?this.node.setAttributeNS(s,e,i.toString()):this.node.setAttribute(e,i.toString()),!this.rebuild||"font-size"!=e&&"x"!=e||this.rebuild(e,i);}return this}}),a.extend(a.Element,{transform:function(e,i){var s;return "object"!==t(e)?(s=new a.Matrix(this).extract(),"string"==typeof e?s[e]:s):(s=new a.Matrix(this),i=!!i||!!e.relative,null!=e.a&&(s=i?s.multiply(new a.Matrix(e)):new a.Matrix(e)),this.attr("transform",s))}}),a.extend(a.Element,{untransform:function(){return this.attr("transform",null)},matrixify:function(){return (this.attr("transform")||"").split(a.regex.transforms).slice(0,-1).map((function(t){var e=t.trim().split("(");return [e[0],e[1].split(a.regex.delimiter).map((function(t){return parseFloat(t)}))]})).reduce((function(t,e){return "matrix"==e[0]?t.multiply(p(e[1])):t[e[0]].apply(t,e[1])}),new a.Matrix)},toParent:function(t){if(this==t)return this;var e=this.screenCTM(),i=t.screenCTM().inverse();return this.addTo(t).untransform().transform(i.multiply(e)),this},toDoc:function(){return this.toParent(this.doc())}}),a.Transformation=a.invent({create:function(e,i){if(arguments.length>1&&"boolean"!=typeof i)return this.constructor.call(this,[].slice.call(arguments));if(Array.isArray(e))for(var a=0,s=this.arguments.length;a<s;++a)this[this.arguments[a]]=e[a];else if("object"===t(e))for(a=0,s=this.arguments.length;a<s;++a)this[this.arguments[a]]=e[this.arguments[a]];this.inversed=!1,!0===i&&(this.inversed=!0);}}),a.Translate=a.invent({parent:a.Matrix,inherit:a.Transformation,create:function(t,e){this.constructor.apply(this,[].slice.call(arguments));},extend:{arguments:["transformedX","transformedY"],method:"translate"}}),a.extend(a.Element,{style:function(e,i){if(0==arguments.length)return this.node.style.cssText||"";if(arguments.length<2)if("object"===t(e))for(var s in e)this.style(s,e[s]);else {if(!a.regex.isCss.test(e))return this.node.style[c(e)];for(e=e.split(/\s*;\s*/).filter((function(t){return !!t})).map((function(t){return t.split(/\s*:\s*/)}));i=e.pop();)this.style(i[0],i[1]);}else this.node.style[c(e)]=null===i||a.regex.isBlank.test(i)?"":i;return this}}),a.Parent=a.invent({create:function(t){this.constructor.call(this,t);},inherit:a.Element,extend:{children:function(){return a.utils.map(a.utils.filterSVGElements(this.node.childNodes),(function(t){return a.adopt(t)}))},add:function(t,e){return null==e?this.node.appendChild(t.node):t.node!=this.node.childNodes[e]&&this.node.insertBefore(t.node,this.node.childNodes[e]),this},put:function(t,e){return this.add(t,e),t},has:function(t){return this.index(t)>=0},index:function(t){return [].slice.call(this.node.childNodes).indexOf(t.node)},get:function(t){return a.adopt(this.node.childNodes[t])},first:function(){return this.get(0)},last:function(){return this.get(this.node.childNodes.length-1)},each:function(t,e){for(var i=this.children(),s=0,r=i.length;s<r;s++)i[s]instanceof a.Element&&t.apply(i[s],[s,i]),e&&i[s]instanceof a.Container&&i[s].each(t,e);return this},removeElement:function(t){return this.node.removeChild(t.node),this},clear:function(){for(;this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);return delete this._defs,this},defs:function(){return this.doc().defs()}}}),a.extend(a.Parent,{ungroup:function(t,e){return 0===e||this instanceof a.Defs||this.node==a.parser.draw?this:(t=t||(this instanceof a.Doc?this:this.parent(a.Parent)),e=e||1/0,this.each((function(){return this instanceof a.Defs?this:this instanceof a.Parent?this.ungroup(t,e-1):this.toParent(t)})),this.node.firstChild||this.remove(),this)},flatten:function(t,e){return this.ungroup(t,e)}}),a.Container=a.invent({create:function(t){this.constructor.call(this,t);},inherit:a.Parent}),a.ViewBox=a.invent({parent:a.Container,construct:{}}),["click","dblclick","mousedown","mouseup","mouseover","mouseout","mousemove","touchstart","touchmove","touchleave","touchend","touchcancel"].forEach((function(t){a.Element.prototype[t]=function(e){return a.on(this.node,t,e),this};})),a.listeners=[],a.handlerMap=[],a.listenerId=0,a.on=function(t,e,i,s,r){var n=i.bind(s||t.instance||t),o=(a.handlerMap.indexOf(t)+1||a.handlerMap.push(t))-1,l=e.split(".")[0],h=e.split(".")[1]||"*";a.listeners[o]=a.listeners[o]||{},a.listeners[o][l]=a.listeners[o][l]||{},a.listeners[o][l][h]=a.listeners[o][l][h]||{},i._svgjsListenerId||(i._svgjsListenerId=++a.listenerId),a.listeners[o][l][h][i._svgjsListenerId]=n,t.addEventListener(l,n,r||!1);},a.off=function(t,e,i){var s=a.handlerMap.indexOf(t),r=e&&e.split(".")[0],n=e&&e.split(".")[1],o="";if(-1!=s)if(i){if("function"==typeof i&&(i=i._svgjsListenerId),!i)return;a.listeners[s][r]&&a.listeners[s][r][n||"*"]&&(t.removeEventListener(r,a.listeners[s][r][n||"*"][i],!1),delete a.listeners[s][r][n||"*"][i]);}else if(n&&r){if(a.listeners[s][r]&&a.listeners[s][r][n]){for(var l in a.listeners[s][r][n])a.off(t,[r,n].join("."),l);delete a.listeners[s][r][n];}}else if(n)for(var h in a.listeners[s])for(var o in a.listeners[s][h])n===o&&a.off(t,[h,n].join("."));else if(r){if(a.listeners[s][r]){for(var o in a.listeners[s][r])a.off(t,[r,o].join("."));delete a.listeners[s][r];}}else {for(var h in a.listeners[s])a.off(t,h);delete a.listeners[s],delete a.handlerMap[s];}},a.extend(a.Element,{on:function(t,e,i,s){return a.on(this.node,t,e,i,s),this},off:function(t,e){return a.off(this.node,t,e),this},fire:function(t,i){return t instanceof e.Event?this.node.dispatchEvent(t):this.node.dispatchEvent(t=new a.CustomEvent(t,{detail:i,cancelable:!0})),this._event=t,this},event:function(){return this._event}}),a.Defs=a.invent({create:"defs",inherit:a.Container}),a.G=a.invent({create:"g",inherit:a.Container,extend:{x:function(t){return null==t?this.transform("x"):this.transform({x:t-this.x()},!0)}},construct:{group:function(){return this.put(new a.G)}}}),a.Doc=a.invent({create:function(t){t&&("svg"==(t="string"==typeof t?i.getElementById(t):t).nodeName?this.constructor.call(this,t):(this.constructor.call(this,a.create("svg")),t.appendChild(this.node),this.size("100%","100%")),this.namespace().defs());},inherit:a.Container,extend:{namespace:function(){return this.attr({xmlns:a.ns,version:"1.1"}).attr("xmlns:xlink",a.xlink,a.xmlns).attr("xmlns:svgjs",a.svgjs,a.xmlns)},defs:function(){var t;return this._defs||((t=this.node.getElementsByTagName("defs")[0])?this._defs=a.adopt(t):this._defs=new a.Defs,this.node.appendChild(this._defs.node)),this._defs},parent:function(){return this.node.parentNode&&"#document"!=this.node.parentNode.nodeName?this.node.parentNode:null},remove:function(){return this.parent()&&this.parent().removeChild(this.node),this},clear:function(){for(;this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);return delete this._defs,a.parser.draw&&!a.parser.draw.parentNode&&this.node.appendChild(a.parser.draw),this},clone:function(t){this.writeDataToDom();var e=this.node,i=x(e.cloneNode(!0));return t?(t.node||t).appendChild(i.node):e.parentNode.insertBefore(i.node,e.nextSibling),i}}}),a.extend(a.Element,{}),a.Gradient=a.invent({create:function(t){this.constructor.call(this,a.create(t+"Gradient")),this.type=t;},inherit:a.Container,extend:{at:function(t,e,i){return this.put(new a.Stop).update(t,e,i)},update:function(t){return this.clear(),"function"==typeof t&&t.call(this,this),this},fill:function(){return "url(#"+this.id()+")"},toString:function(){return this.fill()},attr:function(t,e,i){return "transform"==t&&(t="gradientTransform"),a.Container.prototype.attr.call(this,t,e,i)}},construct:{gradient:function(t,e){return this.defs().gradient(t,e)}}}),a.extend(a.Gradient,a.FX,{from:function(t,e){return "radial"==(this._target||this).type?this.attr({fx:new a.Number(t),fy:new a.Number(e)}):this.attr({x1:new a.Number(t),y1:new a.Number(e)})},to:function(t,e){return "radial"==(this._target||this).type?this.attr({cx:new a.Number(t),cy:new a.Number(e)}):this.attr({x2:new a.Number(t),y2:new a.Number(e)})}}),a.extend(a.Defs,{gradient:function(t,e){return this.put(new a.Gradient(t)).update(e)}}),a.Stop=a.invent({create:"stop",inherit:a.Element,extend:{update:function(t){return ("number"==typeof t||t instanceof a.Number)&&(t={offset:arguments[0],color:arguments[1],opacity:arguments[2]}),null!=t.opacity&&this.attr("stop-opacity",t.opacity),null!=t.color&&this.attr("stop-color",t.color),null!=t.offset&&this.attr("offset",new a.Number(t.offset)),this}}}),a.Pattern=a.invent({create:"pattern",inherit:a.Container,extend:{fill:function(){return "url(#"+this.id()+")"},update:function(t){return this.clear(),"function"==typeof t&&t.call(this,this),this},toString:function(){return this.fill()},attr:function(t,e,i){return "transform"==t&&(t="patternTransform"),a.Container.prototype.attr.call(this,t,e,i)}},construct:{pattern:function(t,e,i){return this.defs().pattern(t,e,i)}}}),a.extend(a.Defs,{pattern:function(t,e,i){return this.put(new a.Pattern).update(i).attr({x:0,y:0,width:t,height:e,patternUnits:"userSpaceOnUse"})}}),a.Shape=a.invent({create:function(t){this.constructor.call(this,t);},inherit:a.Element}),a.Symbol=a.invent({create:"symbol",inherit:a.Container,construct:{symbol:function(){return this.put(new a.Symbol)}}}),a.Use=a.invent({create:"use",inherit:a.Shape,extend:{element:function(t,e){return this.attr("href",(e||"")+"#"+t,a.xlink)}},construct:{use:function(t,e){return this.put(new a.Use).element(t,e)}}}),a.Rect=a.invent({create:"rect",inherit:a.Shape,construct:{rect:function(t,e){return this.put(new a.Rect).size(t,e)}}}),a.Circle=a.invent({create:"circle",inherit:a.Shape,construct:{circle:function(t){return this.put(new a.Circle).rx(new a.Number(t).divide(2)).move(0,0)}}}),a.extend(a.Circle,a.FX,{rx:function(t){return this.attr("r",t)},ry:function(t){return this.rx(t)}}),a.Ellipse=a.invent({create:"ellipse",inherit:a.Shape,construct:{ellipse:function(t,e){return this.put(new a.Ellipse).size(t,e).move(0,0)}}}),a.extend(a.Ellipse,a.Rect,a.FX,{rx:function(t){return this.attr("rx",t)},ry:function(t){return this.attr("ry",t)}}),a.extend(a.Circle,a.Ellipse,{x:function(t){return null==t?this.cx()-this.rx():this.cx(t+this.rx())},y:function(t){return null==t?this.cy()-this.ry():this.cy(t+this.ry())},cx:function(t){return null==t?this.attr("cx"):this.attr("cx",t)},cy:function(t){return null==t?this.attr("cy"):this.attr("cy",t)},width:function(t){return null==t?2*this.rx():this.rx(new a.Number(t).divide(2))},height:function(t){return null==t?2*this.ry():this.ry(new a.Number(t).divide(2))},size:function(t,e){var i=u(this,t,e);return this.rx(new a.Number(i.width).divide(2)).ry(new a.Number(i.height).divide(2))}}),a.Line=a.invent({create:"line",inherit:a.Shape,extend:{array:function(){return new a.PointArray([[this.attr("x1"),this.attr("y1")],[this.attr("x2"),this.attr("y2")]])},plot:function(t,e,i,s){return null==t?this.array():(t=void 0!==e?{x1:t,y1:e,x2:i,y2:s}:new a.PointArray(t).toLine(),this.attr(t))},move:function(t,e){return this.attr(this.array().move(t,e).toLine())},size:function(t,e){var i=u(this,t,e);return this.attr(this.array().size(i.width,i.height).toLine())}},construct:{line:function(t,e,i,s){return a.Line.prototype.plot.apply(this.put(new a.Line),null!=t?[t,e,i,s]:[0,0,0,0])}}}),a.Polyline=a.invent({create:"polyline",inherit:a.Shape,construct:{polyline:function(t){return this.put(new a.Polyline).plot(t||new a.PointArray)}}}),a.Polygon=a.invent({create:"polygon",inherit:a.Shape,construct:{polygon:function(t){return this.put(new a.Polygon).plot(t||new a.PointArray)}}}),a.extend(a.Polyline,a.Polygon,{array:function(){return this._array||(this._array=new a.PointArray(this.attr("points")))},plot:function(t){return null==t?this.array():this.clear().attr("points","string"==typeof t?t:this._array=new a.PointArray(t))},clear:function(){return delete this._array,this},move:function(t,e){return this.attr("points",this.array().move(t,e))},size:function(t,e){var i=u(this,t,e);return this.attr("points",this.array().size(i.width,i.height))}}),a.extend(a.Line,a.Polyline,a.Polygon,{morphArray:a.PointArray,x:function(t){return null==t?this.bbox().x:this.move(t,this.bbox().y)},y:function(t){return null==t?this.bbox().y:this.move(this.bbox().x,t)},width:function(t){var e=this.bbox();return null==t?e.width:this.size(t,e.height)},height:function(t){var e=this.bbox();return null==t?e.height:this.size(e.width,t)}}),a.Path=a.invent({create:"path",inherit:a.Shape,extend:{morphArray:a.PathArray,array:function(){return this._array||(this._array=new a.PathArray(this.attr("d")))},plot:function(t){return null==t?this.array():this.clear().attr("d","string"==typeof t?t:this._array=new a.PathArray(t))},clear:function(){return delete this._array,this}},construct:{path:function(t){return this.put(new a.Path).plot(t||new a.PathArray)}}}),a.Image=a.invent({create:"image",inherit:a.Shape,extend:{load:function(t){if(!t)return this;var i=this,s=new e.Image;return a.on(s,"load",(function(){a.off(s);var e=i.parent(a.Pattern);null!==e&&(0==i.width()&&0==i.height()&&i.size(s.width,s.height),e&&0==e.width()&&0==e.height()&&e.size(i.width(),i.height()),"function"==typeof i._loaded&&i._loaded.call(i,{width:s.width,height:s.height,ratio:s.width/s.height,url:t}));})),a.on(s,"error",(function(t){a.off(s),"function"==typeof i._error&&i._error.call(i,t);})),this.attr("href",s.src=this.src=t,a.xlink)},loaded:function(t){return this._loaded=t,this},error:function(t){return this._error=t,this}},construct:{image:function(t,e,i){return this.put(new a.Image).load(t).size(e||0,i||e||0)}}}),a.Text=a.invent({create:function(){this.constructor.call(this,a.create("text")),this.dom.leading=new a.Number(1.3),this._rebuild=!0,this._build=!1,this.attr("font-family",a.defaults.attrs["font-family"]);},inherit:a.Shape,extend:{x:function(t){return null==t?this.attr("x"):this.attr("x",t)},text:function(t){if(void 0===t){t="";for(var e=this.node.childNodes,i=0,s=e.length;i<s;++i)0!=i&&3!=e[i].nodeType&&1==a.adopt(e[i]).dom.newLined&&(t+="\n"),t+=e[i].textContent;return t}if(this.clear().build(!0),"function"==typeof t)t.call(this,this);else {i=0;for(var r=(t=t.split("\n")).length;i<r;i++)this.tspan(t[i]).newLine();}return this.build(!1).rebuild()},size:function(t){return this.attr("font-size",t).rebuild()},leading:function(t){return null==t?this.dom.leading:(this.dom.leading=new a.Number(t),this.rebuild())},lines:function(){var t=(this.textPath&&this.textPath()||this).node,e=a.utils.map(a.utils.filterSVGElements(t.childNodes),(function(t){return a.adopt(t)}));return new a.Set(e)},rebuild:function(t){if("boolean"==typeof t&&(this._rebuild=t),this._rebuild){var e=this,i=0,s=this.dom.leading*new a.Number(this.attr("font-size"));this.lines().each((function(){this.dom.newLined&&(e.textPath()||this.attr("x",e.attr("x")),"\n"==this.text()?i+=s:(this.attr("dy",s+i),i=0));})),this.fire("rebuild");}return this},build:function(t){return this._build=!!t,this},setData:function(t){return this.dom=t,this.dom.leading=new a.Number(t.leading||1.3),this}},construct:{text:function(t){return this.put(new a.Text).text(t)},plain:function(t){return this.put(new a.Text).plain(t)}}}),a.Tspan=a.invent({create:"tspan",inherit:a.Shape,extend:{text:function(t){return null==t?this.node.textContent+(this.dom.newLined?"\n":""):("function"==typeof t?t.call(this,this):this.plain(t),this)},dx:function(t){return this.attr("dx",t)},dy:function(t){return this.attr("dy",t)},newLine:function(){var t=this.parent(a.Text);return this.dom.newLined=!0,this.dy(t.dom.leading*t.attr("font-size")).attr("x",t.x())}}}),a.extend(a.Text,a.Tspan,{plain:function(t){return !1===this._build&&this.clear(),this.node.appendChild(i.createTextNode(t)),this},tspan:function(t){var e=(this.textPath&&this.textPath()||this).node,i=new a.Tspan;return !1===this._build&&this.clear(),e.appendChild(i.node),i.text(t)},clear:function(){for(var t=(this.textPath&&this.textPath()||this).node;t.hasChildNodes();)t.removeChild(t.lastChild);return this},length:function(){return this.node.getComputedTextLength()}}),a.TextPath=a.invent({create:"textPath",inherit:a.Parent,parent:a.Text,construct:{morphArray:a.PathArray,array:function(){var t=this.track();return t?t.array():null},plot:function(t){var e=this.track(),i=null;return e&&(i=e.plot(t)),null==t?i:this},track:function(){var t=this.textPath();if(t)return t.reference("href")},textPath:function(){if(this.node.firstChild&&"textPath"==this.node.firstChild.nodeName)return a.adopt(this.node.firstChild)}}}),a.Nested=a.invent({create:function(){this.constructor.call(this,a.create("svg")),this.style("overflow","visible");},inherit:a.Container,construct:{nested:function(){return this.put(new a.Nested)}}});var l={stroke:["color","width","opacity","linecap","linejoin","miterlimit","dasharray","dashoffset"],fill:["color","opacity","rule"],prefix:function(t,e){return "color"==e?t:t+"-"+e}};function h(t,e,i,s){return i+s.replace(a.regex.dots," .")}function c(t){return t.toLowerCase().replace(/-(.)/g,(function(t,e){return e.toUpperCase()}))}function d(t){return t.charAt(0).toUpperCase()+t.slice(1)}function g(t){var e=t.toString(16);return 1==e.length?"0"+e:e}function u(t,e,i){if(null==e||null==i){var a=t.bbox();null==e?e=a.width/a.height*i:null==i&&(i=a.height/a.width*e);}return {width:e,height:i}}function f(t,e,i){return {x:e*t.a+i*t.c+0,y:e*t.b+i*t.d+0}}function p(t){return {a:t[0],b:t[1],c:t[2],d:t[3],e:t[4],f:t[5]}}function x(t){for(var i=t.childNodes.length-1;i>=0;i--)t.childNodes[i]instanceof e.SVGElement&&x(t.childNodes[i]);return a.adopt(t).id(a.eid(t.nodeName))}function b(t){return null==t.x&&(t.x=0,t.y=0,t.width=0,t.height=0),t.w=t.width,t.h=t.height,t.x2=t.x+t.width,t.y2=t.y+t.height,t.cx=t.x+t.width/2,t.cy=t.y+t.height/2,t}function m(t){return Math.abs(t)>1e-37?t:0}["fill","stroke"].forEach((function(t){var e={};e[t]=function(e){if(void 0===e)return this;if("string"==typeof e||a.Color.isRgb(e)||e&&"function"==typeof e.fill)this.attr(t,e);else for(var i=l[t].length-1;i>=0;i--)null!=e[l[t][i]]&&this.attr(l.prefix(t,l[t][i]),e[l[t][i]]);return this},a.extend(a.Element,a.FX,e);})),a.extend(a.Element,a.FX,{translate:function(t,e){return this.transform({x:t,y:e})},matrix:function(t){return this.attr("transform",new a.Matrix(6==arguments.length?[].slice.call(arguments):t))},opacity:function(t){return this.attr("opacity",t)},dx:function(t){return this.x(new a.Number(t).plus(this instanceof a.FX?0:this.x()),!0)},dy:function(t){return this.y(new a.Number(t).plus(this instanceof a.FX?0:this.y()),!0)}}),a.extend(a.Path,{length:function(){return this.node.getTotalLength()},pointAt:function(t){return this.node.getPointAtLength(t)}}),a.Set=a.invent({create:function(t){Array.isArray(t)?this.members=t:this.clear();},extend:{add:function(){for(var t=[].slice.call(arguments),e=0,i=t.length;e<i;e++)this.members.push(t[e]);return this},remove:function(t){var e=this.index(t);return e>-1&&this.members.splice(e,1),this},each:function(t){for(var e=0,i=this.members.length;e<i;e++)t.apply(this.members[e],[e,this.members]);return this},clear:function(){return this.members=[],this},length:function(){return this.members.length},has:function(t){return this.index(t)>=0},index:function(t){return this.members.indexOf(t)},get:function(t){return this.members[t]},first:function(){return this.get(0)},last:function(){return this.get(this.members.length-1)},valueOf:function(){return this.members}},construct:{set:function(t){return new a.Set(t)}}}),a.FX.Set=a.invent({create:function(t){this.set=t;}}),a.Set.inherit=function(){var t=[];for(var e in a.Shape.prototype)"function"==typeof a.Shape.prototype[e]&&"function"!=typeof a.Set.prototype[e]&&t.push(e);for(var e in t.forEach((function(t){a.Set.prototype[t]=function(){for(var e=0,i=this.members.length;e<i;e++)this.members[e]&&"function"==typeof this.members[e][t]&&this.members[e][t].apply(this.members[e],arguments);return "animate"==t?this.fx||(this.fx=new a.FX.Set(this)):this};})),t=[],a.FX.prototype)"function"==typeof a.FX.prototype[e]&&"function"!=typeof a.FX.Set.prototype[e]&&t.push(e);t.forEach((function(t){a.FX.Set.prototype[t]=function(){for(var e=0,i=this.set.members.length;e<i;e++)this.set.members[e].fx[t].apply(this.set.members[e].fx,arguments);return this};}));},a.extend(a.Element,{}),a.extend(a.Element,{remember:function(e,i){if("object"===t(arguments[0]))for(var a in e)this.remember(a,e[a]);else {if(1==arguments.length)return this.memory()[e];this.memory()[e]=i;}return this},forget:function(){if(0==arguments.length)this._memory={};else for(var t=arguments.length-1;t>=0;t--)delete this.memory()[arguments[t]];return this},memory:function(){return this._memory||(this._memory={})}}),a.get=function(t){var e=i.getElementById(function(t){var e=(t||"").toString().match(a.regex.reference);if(e)return e[1]}(t)||t);return a.adopt(e)},a.select=function(t,e){return new a.Set(a.utils.map((e||i).querySelectorAll(t),(function(t){return a.adopt(t)})))},a.extend(a.Parent,{select:function(t){return a.select(t,this.node)}});var v="abcdef".split("");if("function"!=typeof e.CustomEvent){var y=function(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var a=i.createEvent("CustomEvent");return a.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),a};y.prototype=e.Event.prototype,a.CustomEvent=y;}else a.CustomEvent=e.CustomEvent;return a},"function"==typeof define&&define.amd?define((function(){return k(w,w.document)})):"object"===("undefined"==typeof exports?"undefined":t(exports))&&"undefined"!=typeof module?module.exports=w.document?k(w,w.document):function(t){return k(t,t.document)}:w.SVG=k(w,w.document),
    /*! svg.filter.js - v2.0.2 - 2016-02-24
    * https://github.com/wout/svg.filter.js
    * Copyright (c) 2016 Wout Fierens; Licensed MIT */
    function(){SVG.Filter=SVG.invent({create:"filter",inherit:SVG.Parent,extend:{source:"SourceGraphic",sourceAlpha:"SourceAlpha",background:"BackgroundImage",backgroundAlpha:"BackgroundAlpha",fill:"FillPaint",stroke:"StrokePaint",autoSetIn:!0,put:function(t,e){return this.add(t,e),!t.attr("in")&&this.autoSetIn&&t.attr("in",this.source),t.attr("result")||t.attr("result",t),t},blend:function(t,e,i){return this.put(new SVG.BlendEffect(t,e,i))},colorMatrix:function(t,e){return this.put(new SVG.ColorMatrixEffect(t,e))},convolveMatrix:function(t){return this.put(new SVG.ConvolveMatrixEffect(t))},componentTransfer:function(t){return this.put(new SVG.ComponentTransferEffect(t))},composite:function(t,e,i){return this.put(new SVG.CompositeEffect(t,e,i))},flood:function(t,e){return this.put(new SVG.FloodEffect(t,e))},offset:function(t,e){return this.put(new SVG.OffsetEffect(t,e))},image:function(t){return this.put(new SVG.ImageEffect(t))},merge:function(){var t=[void 0];for(var e in arguments)t.push(arguments[e]);return this.put(new(SVG.MergeEffect.bind.apply(SVG.MergeEffect,t)))},gaussianBlur:function(t,e){return this.put(new SVG.GaussianBlurEffect(t,e))},morphology:function(t,e){return this.put(new SVG.MorphologyEffect(t,e))},diffuseLighting:function(t,e,i){return this.put(new SVG.DiffuseLightingEffect(t,e,i))},displacementMap:function(t,e,i,a,s){return this.put(new SVG.DisplacementMapEffect(t,e,i,a,s))},specularLighting:function(t,e,i,a){return this.put(new SVG.SpecularLightingEffect(t,e,i,a))},tile:function(){return this.put(new SVG.TileEffect)},turbulence:function(t,e,i,a,s){return this.put(new SVG.TurbulenceEffect(t,e,i,a,s))},toString:function(){return "url(#"+this.attr("id")+")"}}}),SVG.extend(SVG.Defs,{filter:function(t){var e=this.put(new SVG.Filter);return "function"==typeof t&&t.call(e,e),e}}),SVG.extend(SVG.Container,{filter:function(t){return this.defs().filter(t)}}),SVG.extend(SVG.Element,SVG.G,SVG.Nested,{filter:function(t){return this.filterer=t instanceof SVG.Element?t:this.doc().filter(t),this.doc()&&this.filterer.doc()!==this.doc()&&this.doc().defs().add(this.filterer),this.attr("filter",this.filterer),this.filterer},unfilter:function(t){return this.filterer&&!0===t&&this.filterer.remove(),delete this.filterer,this.attr("filter",null)}}),SVG.Effect=SVG.invent({create:function(){this.constructor.call(this);},inherit:SVG.Element,extend:{in:function(t){return null==t?this.parent()&&this.parent().select('[result="'+this.attr("in")+'"]').get(0)||this.attr("in"):this.attr("in",t)},result:function(t){return null==t?this.attr("result"):this.attr("result",t)},toString:function(){return this.result()}}}),SVG.ParentEffect=SVG.invent({create:function(){this.constructor.call(this);},inherit:SVG.Parent,extend:{in:function(t){return null==t?this.parent()&&this.parent().select('[result="'+this.attr("in")+'"]').get(0)||this.attr("in"):this.attr("in",t)},result:function(t){return null==t?this.attr("result"):this.attr("result",t)},toString:function(){return this.result()}}});var t={blend:function(t,e){return this.parent()&&this.parent().blend(this,t,e)},colorMatrix:function(t,e){return this.parent()&&this.parent().colorMatrix(t,e).in(this)},convolveMatrix:function(t){return this.parent()&&this.parent().convolveMatrix(t).in(this)},componentTransfer:function(t){return this.parent()&&this.parent().componentTransfer(t).in(this)},composite:function(t,e){return this.parent()&&this.parent().composite(this,t,e)},flood:function(t,e){return this.parent()&&this.parent().flood(t,e)},offset:function(t,e){return this.parent()&&this.parent().offset(t,e).in(this)},image:function(t){return this.parent()&&this.parent().image(t)},merge:function(){return this.parent()&&this.parent().merge.apply(this.parent(),[this].concat(arguments))},gaussianBlur:function(t,e){return this.parent()&&this.parent().gaussianBlur(t,e).in(this)},morphology:function(t,e){return this.parent()&&this.parent().morphology(t,e).in(this)},diffuseLighting:function(t,e,i){return this.parent()&&this.parent().diffuseLighting(t,e,i).in(this)},displacementMap:function(t,e,i,a){return this.parent()&&this.parent().displacementMap(this,t,e,i,a)},specularLighting:function(t,e,i,a){return this.parent()&&this.parent().specularLighting(t,e,i,a).in(this)},tile:function(){return this.parent()&&this.parent().tile().in(this)},turbulence:function(t,e,i,a,s){return this.parent()&&this.parent().turbulence(t,e,i,a,s).in(this)}};SVG.extend(SVG.Effect,t),SVG.extend(SVG.ParentEffect,t),SVG.ChildEffect=SVG.invent({create:function(){this.constructor.call(this);},inherit:SVG.Element,extend:{in:function(t){this.attr("in",t);}}});var e={blend:function(t,e,i){this.attr({in:t,in2:e,mode:i||"normal"});},colorMatrix:function(t,e){"matrix"==t&&(e=s(e)),this.attr({type:t,values:void 0===e?null:e});},convolveMatrix:function(t){t=s(t),this.attr({order:Math.sqrt(t.split(" ").length),kernelMatrix:t});},composite:function(t,e,i){this.attr({in:t,in2:e,operator:i});},flood:function(t,e){this.attr("flood-color",t),null!=e&&this.attr("flood-opacity",e);},offset:function(t,e){this.attr({dx:t,dy:e});},image:function(t){this.attr("href",t,SVG.xlink);},displacementMap:function(t,e,i,a,s){this.attr({in:t,in2:e,scale:i,xChannelSelector:a,yChannelSelector:s});},gaussianBlur:function(t,e){null!=t||null!=e?this.attr("stdDeviation",r(Array.prototype.slice.call(arguments))):this.attr("stdDeviation","0 0");},morphology:function(t,e){this.attr({operator:t,radius:e});},tile:function(){},turbulence:function(t,e,i,a,s){this.attr({numOctaves:e,seed:i,stitchTiles:a,baseFrequency:t,type:s});}},i={merge:function(){var t;if(arguments[0]instanceof SVG.Set){var e=this;arguments[0].each((function(t){this instanceof SVG.MergeNode?e.put(this):(this instanceof SVG.Effect||this instanceof SVG.ParentEffect)&&e.put(new SVG.MergeNode(this));}));}else {t=Array.isArray(arguments[0])?arguments[0]:arguments;for(var i=0;i<t.length;i++)t[i]instanceof SVG.MergeNode?this.put(t[i]):this.put(new SVG.MergeNode(t[i]));}},componentTransfer:function(t){if(this.rgb=new SVG.Set,["r","g","b","a"].forEach(function(t){this[t]=new(SVG["Func"+t.toUpperCase()])("identity"),this.rgb.add(this[t]),this.node.appendChild(this[t].node);}.bind(this)),t)for(var e in t.rgb&&(["r","g","b"].forEach(function(e){this[e].attr(t.rgb);}.bind(this)),delete t.rgb),t)this[e].attr(t[e]);},diffuseLighting:function(t,e,i){this.attr({surfaceScale:t,diffuseConstant:e,kernelUnitLength:i});},specularLighting:function(t,e,i,a){this.attr({surfaceScale:t,diffuseConstant:e,specularExponent:i,kernelUnitLength:a});}},a={distantLight:function(t,e){this.attr({azimuth:t,elevation:e});},pointLight:function(t,e,i){this.attr({x:t,y:e,z:i});},spotLight:function(t,e,i,a,s,r){this.attr({x:t,y:e,z:i,pointsAtX:a,pointsAtY:s,pointsAtZ:r});},mergeNode:function(t){this.attr("in",t);}};function s(t){return Array.isArray(t)&&(t=new SVG.Array(t)),t.toString().replace(/^\s+/,"").replace(/\s+$/,"").replace(/\s+/g," ")}function r(t){if(!Array.isArray(t))return t;for(var e=0,i=t.length,a=[];e<i;e++)a.push(t[e]);return a.join(" ")}function n(){var t=function(){};for(var e in "function"==typeof arguments[arguments.length-1]&&(t=arguments[arguments.length-1],Array.prototype.splice.call(arguments,arguments.length-1,1)),arguments)for(var i in arguments[e])t(arguments[e][i],i,arguments[e]);}["r","g","b","a"].forEach((function(t){a["Func"+t.toUpperCase()]=function(t){switch(this.attr("type",t),t){case"table":this.attr("tableValues",arguments[1]);break;case"linear":this.attr("slope",arguments[1]),this.attr("intercept",arguments[2]);break;case"gamma":this.attr("amplitude",arguments[1]),this.attr("exponent",arguments[2]),this.attr("offset",arguments[2]);}};})),n(e,(function(t,e){var i=e.charAt(0).toUpperCase()+e.slice(1);SVG[i+"Effect"]=SVG.invent({create:function(){this.constructor.call(this,SVG.create("fe"+i)),t.apply(this,arguments),this.result(this.attr("id")+"Out");},inherit:SVG.Effect,extend:{}});})),n(i,(function(t,e){var i=e.charAt(0).toUpperCase()+e.slice(1);SVG[i+"Effect"]=SVG.invent({create:function(){this.constructor.call(this,SVG.create("fe"+i)),t.apply(this,arguments),this.result(this.attr("id")+"Out");},inherit:SVG.ParentEffect,extend:{}});})),n(a,(function(t,e){var i=e.charAt(0).toUpperCase()+e.slice(1);SVG[i]=SVG.invent({create:function(){this.constructor.call(this,SVG.create("fe"+i)),t.apply(this,arguments);},inherit:SVG.ChildEffect,extend:{}});})),SVG.extend(SVG.MergeEffect,{in:function(t){return t instanceof SVG.MergeNode?this.add(t,0):this.add(new SVG.MergeNode(t),0),this}}),SVG.extend(SVG.CompositeEffect,SVG.BlendEffect,SVG.DisplacementMapEffect,{in2:function(t){return null==t?this.parent()&&this.parent().select('[result="'+this.attr("in2")+'"]').get(0)||this.attr("in2"):this.attr("in2",t)}}),SVG.filter={sepiatone:[.343,.669,.119,0,0,.249,.626,.13,0,0,.172,.334,.111,0,0,0,0,0,1,0]};}.call(void 0),function(){function t(t,s,r,n,o,l,h){for(var c=t.slice(s,r||h),d=n.slice(o,l||h),g=0,u={pos:[0,0],start:[0,0]},f={pos:[0,0],start:[0,0]};;){if(c[g]=e.call(u,c[g]),d[g]=e.call(f,d[g]),c[g][0]!=d[g][0]||"M"==c[g][0]||"A"==c[g][0]&&(c[g][4]!=d[g][4]||c[g][5]!=d[g][5])?(Array.prototype.splice.apply(c,[g,1].concat(a.call(u,c[g]))),Array.prototype.splice.apply(d,[g,1].concat(a.call(f,d[g])))):(c[g]=i.call(u,c[g]),d[g]=i.call(f,d[g])),++g==c.length&&g==d.length)break;g==c.length&&c.push(["C",u.pos[0],u.pos[1],u.pos[0],u.pos[1],u.pos[0],u.pos[1]]),g==d.length&&d.push(["C",f.pos[0],f.pos[1],f.pos[0],f.pos[1],f.pos[0],f.pos[1]]);}return {start:c,dest:d}}function e(t){switch(t[0]){case"z":case"Z":t[0]="L",t[1]=this.start[0],t[2]=this.start[1];break;case"H":t[0]="L",t[2]=this.pos[1];break;case"V":t[0]="L",t[2]=t[1],t[1]=this.pos[0];break;case"T":t[0]="Q",t[3]=t[1],t[4]=t[2],t[1]=this.reflection[1],t[2]=this.reflection[0];break;case"S":t[0]="C",t[6]=t[4],t[5]=t[3],t[4]=t[2],t[3]=t[1],t[2]=this.reflection[1],t[1]=this.reflection[0];}return t}function i(t){var e=t.length;return this.pos=[t[e-2],t[e-1]],-1!="SCQT".indexOf(t[0])&&(this.reflection=[2*this.pos[0]-t[e-4],2*this.pos[1]-t[e-3]]),t}function a(t){var e=[t];switch(t[0]){case"M":return this.pos=this.start=[t[1],t[2]],e;case"L":t[5]=t[3]=t[1],t[6]=t[4]=t[2],t[1]=this.pos[0],t[2]=this.pos[1];break;case"Q":t[6]=t[4],t[5]=t[3],t[4]=1*t[4]/3+2*t[2]/3,t[3]=1*t[3]/3+2*t[1]/3,t[2]=1*this.pos[1]/3+2*t[2]/3,t[1]=1*this.pos[0]/3+2*t[1]/3;break;case"A":t=(e=function(t,e){var i,a,s,r,n,o,l,h,c,d,g,u,f,p,x,b,m,v,y,w,k,A,S,C,L,P,T=Math.abs(e[1]),z=Math.abs(e[2]),I=e[3]%360,M=e[4],E=e[5],X=e[6],Y=e[7],F=new SVG.Point(t),R=new SVG.Point(X,Y),D=[];if(0===T||0===z||F.x===R.x&&F.y===R.y)return [["C",F.x,F.y,R.x,R.y,R.x,R.y]];i=new SVG.Point((F.x-R.x)/2,(F.y-R.y)/2).transform((new SVG.Matrix).rotate(I)),(a=i.x*i.x/(T*T)+i.y*i.y/(z*z))>1&&(a=Math.sqrt(a),T*=a,z*=a);s=(new SVG.Matrix).rotate(I).scale(1/T,1/z).rotate(-I),F=F.transform(s),R=R.transform(s),r=[R.x-F.x,R.y-F.y],o=r[0]*r[0]+r[1]*r[1],n=Math.sqrt(o),r[0]/=n,r[1]/=n,l=o<4?Math.sqrt(1-o/4):0,M===E&&(l*=-1);h=new SVG.Point((R.x+F.x)/2+l*-r[1],(R.y+F.y)/2+l*r[0]),c=new SVG.Point(F.x-h.x,F.y-h.y),d=new SVG.Point(R.x-h.x,R.y-h.y),g=Math.acos(c.x/Math.sqrt(c.x*c.x+c.y*c.y)),c.y<0&&(g*=-1);u=Math.acos(d.x/Math.sqrt(d.x*d.x+d.y*d.y)),d.y<0&&(u*=-1);E&&g>u&&(u+=2*Math.PI);!E&&g<u&&(u-=2*Math.PI);for(p=Math.ceil(2*Math.abs(g-u)/Math.PI),b=[],m=g,f=(u-g)/p,x=4*Math.tan(f/4)/3,k=0;k<=p;k++)y=Math.cos(m),v=Math.sin(m),w=new SVG.Point(h.x+y,h.y+v),b[k]=[new SVG.Point(w.x+x*v,w.y-x*y),w,new SVG.Point(w.x-x*v,w.y+x*y)],m+=f;for(b[0][0]=b[0][1].clone(),b[b.length-1][2]=b[b.length-1][1].clone(),s=(new SVG.Matrix).rotate(I).scale(T,z).rotate(-I),k=0,A=b.length;k<A;k++)b[k][0]=b[k][0].transform(s),b[k][1]=b[k][1].transform(s),b[k][2]=b[k][2].transform(s);for(k=1,A=b.length;k<A;k++)w=b[k-1][2],S=w.x,C=w.y,w=b[k][0],L=w.x,P=w.y,w=b[k][1],X=w.x,Y=w.y,D.push(["C",S,C,L,P,X,Y]);return D}(this.pos,t))[0];}return t[0]="C",this.pos=[t[5],t[6]],this.reflection=[2*t[5]-t[3],2*t[6]-t[4]],e}function s(t,e){if(!1===e)return !1;for(var i=e,a=t.length;i<a;++i)if("M"==t[i][0])return i;return !1}SVG.extend(SVG.PathArray,{morph:function(e){for(var i=this.value,a=this.parse(e),r=0,n=0,o=!1,l=!1;!1!==r||!1!==n;){var h;o=s(i,!1!==r&&r+1),l=s(a,!1!==n&&n+1),!1===r&&(r=0==(h=new SVG.PathArray(c.start).bbox()).height||0==h.width?i.push(i[0])-1:i.push(["M",h.x+h.width/2,h.y+h.height/2])-1),!1===n&&(n=0==(h=new SVG.PathArray(c.dest).bbox()).height||0==h.width?a.push(a[0])-1:a.push(["M",h.x+h.width/2,h.y+h.height/2])-1);var c=t(i,r,o,a,n,l);i=i.slice(0,r).concat(c.start,!1===o?[]:i.slice(o)),a=a.slice(0,n).concat(c.dest,!1===l?[]:a.slice(l)),r=!1!==o&&r+c.start.length,n=!1!==l&&n+c.dest.length;}return this.value=i,this.destination=new SVG.PathArray,this.destination.value=a,this}});}(),
    /*! svg.draggable.js - v2.2.2 - 2019-01-08
    * https://github.com/svgdotjs/svg.draggable.js
    * Copyright (c) 2019 Wout Fierens; Licensed MIT */
    function(){function t(t){t.remember("_draggable",this),this.el=t;}t.prototype.init=function(t,e){var i=this;this.constraint=t,this.value=e,this.el.on("mousedown.drag",(function(t){i.start(t);})),this.el.on("touchstart.drag",(function(t){i.start(t);}));},t.prototype.transformPoint=function(t,e){var i=(t=t||window.event).changedTouches&&t.changedTouches[0]||t;return this.p.x=i.clientX-(e||0),this.p.y=i.clientY,this.p.matrixTransform(this.m)},t.prototype.getBBox=function(){var t=this.el.bbox();return this.el instanceof SVG.Nested&&(t=this.el.rbox()),(this.el instanceof SVG.G||this.el instanceof SVG.Use||this.el instanceof SVG.Nested)&&(t.x=this.el.x(),t.y=this.el.y()),t},t.prototype.start=function(t){if("click"!=t.type&&"mousedown"!=t.type&&"mousemove"!=t.type||1==(t.which||t.buttons)){var e=this;if(this.el.fire("beforedrag",{event:t,handler:this}),!this.el.event().defaultPrevented){t.preventDefault(),t.stopPropagation(),this.parent=this.parent||this.el.parent(SVG.Nested)||this.el.parent(SVG.Doc),this.p=this.parent.node.createSVGPoint(),this.m=this.el.node.getScreenCTM().inverse();var i,a=this.getBBox();if(this.el instanceof SVG.Text)switch(i=this.el.node.getComputedTextLength(),this.el.attr("text-anchor")){case"middle":i/=2;break;case"start":i=0;}this.startPoints={point:this.transformPoint(t,i),box:a,transform:this.el.transform()},SVG.on(window,"mousemove.drag",(function(t){e.drag(t);})),SVG.on(window,"touchmove.drag",(function(t){e.drag(t);})),SVG.on(window,"mouseup.drag",(function(t){e.end(t);})),SVG.on(window,"touchend.drag",(function(t){e.end(t);})),this.el.fire("dragstart",{event:t,p:this.startPoints.point,m:this.m,handler:this});}}},t.prototype.drag=function(t){var e=this.getBBox(),i=this.transformPoint(t),a=this.startPoints.box.x+i.x-this.startPoints.point.x,s=this.startPoints.box.y+i.y-this.startPoints.point.y,r=this.constraint,n=i.x-this.startPoints.point.x,o=i.y-this.startPoints.point.y;if(this.el.fire("dragmove",{event:t,p:i,m:this.m,handler:this}),this.el.event().defaultPrevented)return i;if("function"==typeof r){var l=r.call(this.el,a,s,this.m);"boolean"==typeof l&&(l={x:l,y:l}),!0===l.x?this.el.x(a):!1!==l.x&&this.el.x(l.x),!0===l.y?this.el.y(s):!1!==l.y&&this.el.y(l.y);}else "object"==typeof r&&(null!=r.minX&&a<r.minX?n=(a=r.minX)-this.startPoints.box.x:null!=r.maxX&&a>r.maxX-e.width&&(n=(a=r.maxX-e.width)-this.startPoints.box.x),null!=r.minY&&s<r.minY?o=(s=r.minY)-this.startPoints.box.y:null!=r.maxY&&s>r.maxY-e.height&&(o=(s=r.maxY-e.height)-this.startPoints.box.y),null!=r.snapToGrid&&(a-=a%r.snapToGrid,s-=s%r.snapToGrid,n-=n%r.snapToGrid,o-=o%r.snapToGrid),this.el instanceof SVG.G?this.el.matrix(this.startPoints.transform).transform({x:n,y:o},!0):this.el.move(a,s));return i},t.prototype.end=function(t){var e=this.drag(t);this.el.fire("dragend",{event:t,p:e,m:this.m,handler:this}),SVG.off(window,"mousemove.drag"),SVG.off(window,"touchmove.drag"),SVG.off(window,"mouseup.drag"),SVG.off(window,"touchend.drag");},SVG.extend(SVG.Element,{draggable:function(e,i){"function"!=typeof e&&"object"!=typeof e||(i=e,e=!0);var a=this.remember("_draggable")||new t(this);return (e=void 0===e||e)?a.init(i||{},e):(this.off("mousedown.drag"),this.off("touchstart.drag")),this}});}.call(void 0),function(){function t(t){this.el=t,t.remember("_selectHandler",this),this.pointSelection={isSelected:!1},this.rectSelection={isSelected:!1},this.pointsList={lt:[0,0],rt:["width",0],rb:["width","height"],lb:[0,"height"],t:["width",0],r:["width","height"],b:["width","height"],l:[0,"height"]},this.pointCoord=function(t,e,i){var a="string"!=typeof t?t:e[t];return i?a/2:a},this.pointCoords=function(t,e){var i=this.pointsList[t];return {x:this.pointCoord(i[0],e,"t"===t||"b"===t),y:this.pointCoord(i[1],e,"r"===t||"l"===t)}};}t.prototype.init=function(t,e){var i=this.el.bbox();this.options={};var a=this.el.selectize.defaults.points;for(var s in this.el.selectize.defaults)this.options[s]=this.el.selectize.defaults[s],void 0!==e[s]&&(this.options[s]=e[s]);var r=["points","pointsExclude"];for(var s in r){var n=this.options[r[s]];"string"==typeof n?n=n.length>0?n.split(/\s*,\s*/i):[]:"boolean"==typeof n&&"points"===r[s]&&(n=n?a:[]),this.options[r[s]]=n;}this.options.points=[a,this.options.points].reduce((function(t,e){return t.filter((function(t){return e.indexOf(t)>-1}))})),this.options.points=[this.options.points,this.options.pointsExclude].reduce((function(t,e){return t.filter((function(t){return e.indexOf(t)<0}))})),this.parent=this.el.parent(),this.nested=this.nested||this.parent.group(),this.nested.matrix(new SVG.Matrix(this.el).translate(i.x,i.y)),this.options.deepSelect&&-1!==["line","polyline","polygon"].indexOf(this.el.type)?this.selectPoints(t):this.selectRect(t),this.observe(),this.cleanup();},t.prototype.selectPoints=function(t){return this.pointSelection.isSelected=t,this.pointSelection.set?this:(this.pointSelection.set=this.parent.set(),this.drawPoints(),this)},t.prototype.getPointArray=function(){var t=this.el.bbox();return this.el.array().valueOf().map((function(e){return [e[0]-t.x,e[1]-t.y]}))},t.prototype.drawPoints=function(){for(var t=this,e=this.getPointArray(),i=0,a=e.length;i<a;++i){var s=function(e){return function(i){(i=i||window.event).preventDefault?i.preventDefault():i.returnValue=!1,i.stopPropagation();var a=i.pageX||i.touches[0].pageX,s=i.pageY||i.touches[0].pageY;t.el.fire("point",{x:a,y:s,i:e,event:i});}}(i),r=this.drawPoint(e[i][0],e[i][1]).addClass(this.options.classPoints).addClass(this.options.classPoints+"_point").on("touchstart",s).on("mousedown",s);this.pointSelection.set.add(r);}},t.prototype.drawPoint=function(t,e){var i=this.options.pointType;switch(i){case"circle":return this.drawCircle(t,e);case"rect":return this.drawRect(t,e);default:if("function"==typeof i)return i.call(this,t,e);throw new Error("Unknown "+i+" point type!")}},t.prototype.drawCircle=function(t,e){return this.nested.circle(this.options.pointSize).center(t,e)},t.prototype.drawRect=function(t,e){return this.nested.rect(this.options.pointSize,this.options.pointSize).center(t,e)},t.prototype.updatePointSelection=function(){var t=this.getPointArray();this.pointSelection.set.each((function(e){this.cx()===t[e][0]&&this.cy()===t[e][1]||this.center(t[e][0],t[e][1]);}));},t.prototype.updateRectSelection=function(){var t=this,e=this.el.bbox();if(this.rectSelection.set.get(0).attr({width:e.width,height:e.height}),this.options.points.length&&this.options.points.map((function(i,a){var s=t.pointCoords(i,e);t.rectSelection.set.get(a+1).center(s.x,s.y);})),this.options.rotationPoint){var i=this.rectSelection.set.length();this.rectSelection.set.get(i-1).center(e.width/2,20);}},t.prototype.selectRect=function(t){var e=this,i=this.el.bbox();function a(t){return function(i){(i=i||window.event).preventDefault?i.preventDefault():i.returnValue=!1,i.stopPropagation();var a=i.pageX||i.touches[0].pageX,s=i.pageY||i.touches[0].pageY;e.el.fire(t,{x:a,y:s,event:i});}}if(this.rectSelection.isSelected=t,this.rectSelection.set=this.rectSelection.set||this.parent.set(),this.rectSelection.set.get(0)||this.rectSelection.set.add(this.nested.rect(i.width,i.height).addClass(this.options.classRect)),this.options.points.length&&this.rectSelection.set.length()<2){this.options.points.map((function(t,s){var r=e.pointCoords(t,i),n=e.drawPoint(r.x,r.y).attr("class",e.options.classPoints+"_"+t).on("mousedown",a(t)).on("touchstart",a(t));e.rectSelection.set.add(n);})),this.rectSelection.set.each((function(){this.addClass(e.options.classPoints);}));}if(this.options.rotationPoint&&(this.options.points&&!this.rectSelection.set.get(9)||!this.options.points&&!this.rectSelection.set.get(1))){var s=function(t){(t=t||window.event).preventDefault?t.preventDefault():t.returnValue=!1,t.stopPropagation();var i=t.pageX||t.touches[0].pageX,a=t.pageY||t.touches[0].pageY;e.el.fire("rot",{x:i,y:a,event:t});},r=this.drawPoint(i.width/2,20).attr("class",this.options.classPoints+"_rot").on("touchstart",s).on("mousedown",s);this.rectSelection.set.add(r);}},t.prototype.handler=function(){var t=this.el.bbox();this.nested.matrix(new SVG.Matrix(this.el).translate(t.x,t.y)),this.rectSelection.isSelected&&this.updateRectSelection(),this.pointSelection.isSelected&&this.updatePointSelection();},t.prototype.observe=function(){var t=this;if(MutationObserver)if(this.rectSelection.isSelected||this.pointSelection.isSelected)this.observerInst=this.observerInst||new MutationObserver((function(){t.handler();})),this.observerInst.observe(this.el.node,{attributes:!0});else try{this.observerInst.disconnect(),delete this.observerInst;}catch(t){}else this.el.off("DOMAttrModified.select"),(this.rectSelection.isSelected||this.pointSelection.isSelected)&&this.el.on("DOMAttrModified.select",(function(){t.handler();}));},t.prototype.cleanup=function(){!this.rectSelection.isSelected&&this.rectSelection.set&&(this.rectSelection.set.each((function(){this.remove();})),this.rectSelection.set.clear(),delete this.rectSelection.set),!this.pointSelection.isSelected&&this.pointSelection.set&&(this.pointSelection.set.each((function(){this.remove();})),this.pointSelection.set.clear(),delete this.pointSelection.set),this.pointSelection.isSelected||this.rectSelection.isSelected||(this.nested.remove(),delete this.nested);},SVG.extend(SVG.Element,{selectize:function(e,i){return "object"==typeof e&&(i=e,e=!0),(this.remember("_selectHandler")||new t(this)).init(void 0===e||e,i||{}),this}}),SVG.Element.prototype.selectize.defaults={points:["lt","rt","rb","lb","t","r","b","l"],pointsExclude:[],classRect:"svg_select_boundingRect",classPoints:"svg_select_points",pointSize:7,rotationPoint:!0,deepSelect:!1,pointType:"circle"};}(),function(){(function(){function t(t){t.remember("_resizeHandler",this),this.el=t,this.parameters={},this.lastUpdateCall=null,this.p=t.doc().node.createSVGPoint();}t.prototype.transformPoint=function(t,e,i){return this.p.x=t-(this.offset.x-window.pageXOffset),this.p.y=e-(this.offset.y-window.pageYOffset),this.p.matrixTransform(i||this.m)},t.prototype._extractPosition=function(t){return {x:null!=t.clientX?t.clientX:t.touches[0].clientX,y:null!=t.clientY?t.clientY:t.touches[0].clientY}},t.prototype.init=function(t){var e=this;if(this.stop(),"stop"!==t){for(var i in this.options={},this.el.resize.defaults)this.options[i]=this.el.resize.defaults[i],void 0!==t[i]&&(this.options[i]=t[i]);this.el.on("lt.resize",(function(t){e.resize(t||window.event);})),this.el.on("rt.resize",(function(t){e.resize(t||window.event);})),this.el.on("rb.resize",(function(t){e.resize(t||window.event);})),this.el.on("lb.resize",(function(t){e.resize(t||window.event);})),this.el.on("t.resize",(function(t){e.resize(t||window.event);})),this.el.on("r.resize",(function(t){e.resize(t||window.event);})),this.el.on("b.resize",(function(t){e.resize(t||window.event);})),this.el.on("l.resize",(function(t){e.resize(t||window.event);})),this.el.on("rot.resize",(function(t){e.resize(t||window.event);})),this.el.on("point.resize",(function(t){e.resize(t||window.event);})),this.update();}},t.prototype.stop=function(){return this.el.off("lt.resize"),this.el.off("rt.resize"),this.el.off("rb.resize"),this.el.off("lb.resize"),this.el.off("t.resize"),this.el.off("r.resize"),this.el.off("b.resize"),this.el.off("l.resize"),this.el.off("rot.resize"),this.el.off("point.resize"),this},t.prototype.resize=function(t){var e=this;this.m=this.el.node.getScreenCTM().inverse(),this.offset={x:window.pageXOffset,y:window.pageYOffset};var i=this._extractPosition(t.detail.event);if(this.parameters={type:this.el.type,p:this.transformPoint(i.x,i.y),x:t.detail.x,y:t.detail.y,box:this.el.bbox(),rotation:this.el.transform().rotation},"text"===this.el.type&&(this.parameters.fontSize=this.el.attr()["font-size"]),void 0!==t.detail.i){var a=this.el.array().valueOf();this.parameters.i=t.detail.i,this.parameters.pointCoords=[a[t.detail.i][0],a[t.detail.i][1]];}switch(t.type){case"lt":this.calc=function(t,e){var i=this.snapToGrid(t,e);if(this.parameters.box.width-i[0]>0&&this.parameters.box.height-i[1]>0){if("text"===this.parameters.type)return this.el.move(this.parameters.box.x+i[0],this.parameters.box.y),void this.el.attr("font-size",this.parameters.fontSize-i[0]);i=this.checkAspectRatio(i),this.el.move(this.parameters.box.x+i[0],this.parameters.box.y+i[1]).size(this.parameters.box.width-i[0],this.parameters.box.height-i[1]);}};break;case"rt":this.calc=function(t,e){var i=this.snapToGrid(t,e,2);if(this.parameters.box.width+i[0]>0&&this.parameters.box.height-i[1]>0){if("text"===this.parameters.type)return this.el.move(this.parameters.box.x-i[0],this.parameters.box.y),void this.el.attr("font-size",this.parameters.fontSize+i[0]);i=this.checkAspectRatio(i,!0),this.el.move(this.parameters.box.x,this.parameters.box.y+i[1]).size(this.parameters.box.width+i[0],this.parameters.box.height-i[1]);}};break;case"rb":this.calc=function(t,e){var i=this.snapToGrid(t,e,0);if(this.parameters.box.width+i[0]>0&&this.parameters.box.height+i[1]>0){if("text"===this.parameters.type)return this.el.move(this.parameters.box.x-i[0],this.parameters.box.y),void this.el.attr("font-size",this.parameters.fontSize+i[0]);i=this.checkAspectRatio(i),this.el.move(this.parameters.box.x,this.parameters.box.y).size(this.parameters.box.width+i[0],this.parameters.box.height+i[1]);}};break;case"lb":this.calc=function(t,e){var i=this.snapToGrid(t,e,1);if(this.parameters.box.width-i[0]>0&&this.parameters.box.height+i[1]>0){if("text"===this.parameters.type)return this.el.move(this.parameters.box.x+i[0],this.parameters.box.y),void this.el.attr("font-size",this.parameters.fontSize-i[0]);i=this.checkAspectRatio(i,!0),this.el.move(this.parameters.box.x+i[0],this.parameters.box.y).size(this.parameters.box.width-i[0],this.parameters.box.height+i[1]);}};break;case"t":this.calc=function(t,e){var i=this.snapToGrid(t,e,2);if(this.parameters.box.height-i[1]>0){if("text"===this.parameters.type)return;this.el.move(this.parameters.box.x,this.parameters.box.y+i[1]).height(this.parameters.box.height-i[1]);}};break;case"r":this.calc=function(t,e){var i=this.snapToGrid(t,e,0);if(this.parameters.box.width+i[0]>0){if("text"===this.parameters.type)return;this.el.move(this.parameters.box.x,this.parameters.box.y).width(this.parameters.box.width+i[0]);}};break;case"b":this.calc=function(t,e){var i=this.snapToGrid(t,e,0);if(this.parameters.box.height+i[1]>0){if("text"===this.parameters.type)return;this.el.move(this.parameters.box.x,this.parameters.box.y).height(this.parameters.box.height+i[1]);}};break;case"l":this.calc=function(t,e){var i=this.snapToGrid(t,e,1);if(this.parameters.box.width-i[0]>0){if("text"===this.parameters.type)return;this.el.move(this.parameters.box.x+i[0],this.parameters.box.y).width(this.parameters.box.width-i[0]);}};break;case"rot":this.calc=function(t,e){var i=t+this.parameters.p.x,a=e+this.parameters.p.y,s=Math.atan2(this.parameters.p.y-this.parameters.box.y-this.parameters.box.height/2,this.parameters.p.x-this.parameters.box.x-this.parameters.box.width/2),r=Math.atan2(a-this.parameters.box.y-this.parameters.box.height/2,i-this.parameters.box.x-this.parameters.box.width/2),n=this.parameters.rotation+180*(r-s)/Math.PI+this.options.snapToAngle/2;this.el.center(this.parameters.box.cx,this.parameters.box.cy).rotate(n-n%this.options.snapToAngle,this.parameters.box.cx,this.parameters.box.cy);};break;case"point":this.calc=function(t,e){var i=this.snapToGrid(t,e,this.parameters.pointCoords[0],this.parameters.pointCoords[1]),a=this.el.array().valueOf();a[this.parameters.i][0]=this.parameters.pointCoords[0]+i[0],a[this.parameters.i][1]=this.parameters.pointCoords[1]+i[1],this.el.plot(a);};}this.el.fire("resizestart",{dx:this.parameters.x,dy:this.parameters.y,event:t}),SVG.on(window,"touchmove.resize",(function(t){e.update(t||window.event);})),SVG.on(window,"touchend.resize",(function(){e.done();})),SVG.on(window,"mousemove.resize",(function(t){e.update(t||window.event);})),SVG.on(window,"mouseup.resize",(function(){e.done();}));},t.prototype.update=function(t){if(t){var e=this._extractPosition(t),i=this.transformPoint(e.x,e.y),a=i.x-this.parameters.p.x,s=i.y-this.parameters.p.y;this.lastUpdateCall=[a,s],this.calc(a,s),this.el.fire("resizing",{dx:a,dy:s,event:t});}else this.lastUpdateCall&&this.calc(this.lastUpdateCall[0],this.lastUpdateCall[1]);},t.prototype.done=function(){this.lastUpdateCall=null,SVG.off(window,"mousemove.resize"),SVG.off(window,"mouseup.resize"),SVG.off(window,"touchmove.resize"),SVG.off(window,"touchend.resize"),this.el.fire("resizedone");},t.prototype.snapToGrid=function(t,e,i,a){var s;return void 0!==a?s=[(i+t)%this.options.snapToGrid,(a+e)%this.options.snapToGrid]:(i=null==i?3:i,s=[(this.parameters.box.x+t+(1&i?0:this.parameters.box.width))%this.options.snapToGrid,(this.parameters.box.y+e+(2&i?0:this.parameters.box.height))%this.options.snapToGrid]),t<0&&(s[0]-=this.options.snapToGrid),e<0&&(s[1]-=this.options.snapToGrid),t-=Math.abs(s[0])<this.options.snapToGrid/2?s[0]:s[0]-(t<0?-this.options.snapToGrid:this.options.snapToGrid),e-=Math.abs(s[1])<this.options.snapToGrid/2?s[1]:s[1]-(e<0?-this.options.snapToGrid:this.options.snapToGrid),this.constraintToBox(t,e,i,a)},t.prototype.constraintToBox=function(t,e,i,a){var s,r,n=this.options.constraint||{};return void 0!==a?(s=i,r=a):(s=this.parameters.box.x+(1&i?0:this.parameters.box.width),r=this.parameters.box.y+(2&i?0:this.parameters.box.height)),void 0!==n.minX&&s+t<n.minX&&(t=n.minX-s),void 0!==n.maxX&&s+t>n.maxX&&(t=n.maxX-s),void 0!==n.minY&&r+e<n.minY&&(e=n.minY-r),void 0!==n.maxY&&r+e>n.maxY&&(e=n.maxY-r),[t,e]},t.prototype.checkAspectRatio=function(t,e){if(!this.options.saveAspectRatio)return t;var i=t.slice(),a=this.parameters.box.width/this.parameters.box.height,s=this.parameters.box.width+t[0],r=this.parameters.box.height-t[1],n=s/r;return n<a?(i[1]=s/a-this.parameters.box.height,e&&(i[1]=-i[1])):n>a&&(i[0]=this.parameters.box.width-r*a,e&&(i[0]=-i[0])),i},SVG.extend(SVG.Element,{resize:function(e){return (this.remember("_resizeHandler")||new t(this)).init(e||{}),this}}),SVG.Element.prototype.resize.defaults={snapToAngle:.1,snapToGrid:1,constraint:{},saveAspectRatio:!1};}).call(this);}();!function(t,e){void 0===e&&(e={});var i=e.insertAt;if(t&&"undefined"!=typeof document){var a=document.head||document.getElementsByTagName("head")[0],s=document.createElement("style");s.type="text/css","top"===i&&a.firstChild?a.insertBefore(s,a.firstChild):a.appendChild(s),s.styleSheet?s.styleSheet.cssText=t:s.appendChild(document.createTextNode(t));}}('.apexcharts-canvas {\n  position: relative;\n  user-select: none;\n  /* cannot give overflow: hidden as it will crop tooltips which overflow outside chart area */\n}\n\n\n/* scrollbar is not visible by default for legend, hence forcing the visibility */\n.apexcharts-canvas ::-webkit-scrollbar {\n  -webkit-appearance: none;\n  width: 6px;\n}\n\n.apexcharts-canvas ::-webkit-scrollbar-thumb {\n  border-radius: 4px;\n  background-color: rgba(0, 0, 0, .5);\n  box-shadow: 0 0 1px rgba(255, 255, 255, .5);\n  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);\n}\n\n.apexcharts-canvas.apexcharts-theme-dark {\n  background: #424242;\n}\n\n.apexcharts-inner {\n  position: relative;\n}\n\n.apexcharts-text tspan {\n  font-family: inherit;\n}\n\n.legend-mouseover-inactive {\n  transition: 0.15s ease all;\n  opacity: 0.20;\n}\n\n.apexcharts-series-collapsed {\n  opacity: 0;\n}\n\n.apexcharts-tooltip {\n  border-radius: 5px;\n  box-shadow: 2px 2px 6px -4px #999;\n  cursor: default;\n  font-size: 14px;\n  left: 62px;\n  opacity: 0;\n  pointer-events: none;\n  position: absolute;\n  top: 20px;\n  overflow: hidden;\n  white-space: nowrap;\n  z-index: 12;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-tooltip.apexcharts-active {\n  opacity: 1;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-tooltip.apexcharts-theme-light {\n  border: 1px solid #e3e3e3;\n  background: rgba(255, 255, 255, 0.96);\n}\n\n.apexcharts-tooltip.apexcharts-theme-dark {\n  color: #fff;\n  background: rgba(30, 30, 30, 0.8);\n}\n\n.apexcharts-tooltip * {\n  font-family: inherit;\n}\n\n\n.apexcharts-tooltip-title {\n  padding: 6px;\n  font-size: 15px;\n  margin-bottom: 4px;\n}\n\n.apexcharts-tooltip.apexcharts-theme-light .apexcharts-tooltip-title {\n  background: #ECEFF1;\n  border-bottom: 1px solid #ddd;\n}\n\n.apexcharts-tooltip.apexcharts-theme-dark .apexcharts-tooltip-title {\n  background: rgba(0, 0, 0, 0.7);\n  border-bottom: 1px solid #333;\n}\n\n.apexcharts-tooltip-text-value,\n.apexcharts-tooltip-text-z-value {\n  display: inline-block;\n  font-weight: 600;\n  margin-left: 5px;\n}\n\n.apexcharts-tooltip-text-z-label:empty,\n.apexcharts-tooltip-text-z-value:empty {\n  display: none;\n}\n\n.apexcharts-tooltip-text-value,\n.apexcharts-tooltip-text-z-value {\n  font-weight: 600;\n}\n\n.apexcharts-tooltip-marker {\n  width: 12px;\n  height: 12px;\n  position: relative;\n  top: 0px;\n  margin-right: 10px;\n  border-radius: 50%;\n}\n\n.apexcharts-tooltip-series-group {\n  padding: 0 10px;\n  display: none;\n  text-align: left;\n  justify-content: left;\n  align-items: center;\n}\n\n.apexcharts-tooltip-series-group.apexcharts-active .apexcharts-tooltip-marker {\n  opacity: 1;\n}\n\n.apexcharts-tooltip-series-group.apexcharts-active,\n.apexcharts-tooltip-series-group:last-child {\n  padding-bottom: 4px;\n}\n\n.apexcharts-tooltip-series-group-hidden {\n  opacity: 0;\n  height: 0;\n  line-height: 0;\n  padding: 0 !important;\n}\n\n.apexcharts-tooltip-y-group {\n  padding: 6px 0 5px;\n}\n\n.apexcharts-tooltip-candlestick {\n  padding: 4px 8px;\n}\n\n.apexcharts-tooltip-candlestick>div {\n  margin: 4px 0;\n}\n\n.apexcharts-tooltip-candlestick span.value {\n  font-weight: bold;\n}\n\n.apexcharts-tooltip-rangebar {\n  padding: 5px 8px;\n}\n\n.apexcharts-tooltip-rangebar .category {\n  font-weight: 600;\n  color: #777;\n}\n\n.apexcharts-tooltip-rangebar .series-name {\n  font-weight: bold;\n  display: block;\n  margin-bottom: 5px;\n}\n\n.apexcharts-xaxistooltip {\n  opacity: 0;\n  padding: 9px 10px;\n  pointer-events: none;\n  color: #373d3f;\n  font-size: 13px;\n  text-align: center;\n  border-radius: 2px;\n  position: absolute;\n  z-index: 10;\n  background: #ECEFF1;\n  border: 1px solid #90A4AE;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-xaxistooltip.apexcharts-theme-dark {\n  background: rgba(0, 0, 0, 0.7);\n  border: 1px solid rgba(0, 0, 0, 0.5);\n  color: #fff;\n}\n\n.apexcharts-xaxistooltip:after,\n.apexcharts-xaxistooltip:before {\n  left: 50%;\n  border: solid transparent;\n  content: " ";\n  height: 0;\n  width: 0;\n  position: absolute;\n  pointer-events: none;\n}\n\n.apexcharts-xaxistooltip:after {\n  border-color: rgba(236, 239, 241, 0);\n  border-width: 6px;\n  margin-left: -6px;\n}\n\n.apexcharts-xaxistooltip:before {\n  border-color: rgba(144, 164, 174, 0);\n  border-width: 7px;\n  margin-left: -7px;\n}\n\n.apexcharts-xaxistooltip-bottom:after,\n.apexcharts-xaxistooltip-bottom:before {\n  bottom: 100%;\n}\n\n.apexcharts-xaxistooltip-top:after,\n.apexcharts-xaxistooltip-top:before {\n  top: 100%;\n}\n\n.apexcharts-xaxistooltip-bottom:after {\n  border-bottom-color: #ECEFF1;\n}\n\n.apexcharts-xaxistooltip-bottom:before {\n  border-bottom-color: #90A4AE;\n}\n\n.apexcharts-xaxistooltip-bottom.apexcharts-theme-dark:after {\n  border-bottom-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-xaxistooltip-bottom.apexcharts-theme-dark:before {\n  border-bottom-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-xaxistooltip-top:after {\n  border-top-color: #ECEFF1\n}\n\n.apexcharts-xaxistooltip-top:before {\n  border-top-color: #90A4AE;\n}\n\n.apexcharts-xaxistooltip-top.apexcharts-theme-dark:after {\n  border-top-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-xaxistooltip-top.apexcharts-theme-dark:before {\n  border-top-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-xaxistooltip.apexcharts-active {\n  opacity: 1;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-yaxistooltip {\n  opacity: 0;\n  padding: 4px 10px;\n  pointer-events: none;\n  color: #373d3f;\n  font-size: 13px;\n  text-align: center;\n  border-radius: 2px;\n  position: absolute;\n  z-index: 10;\n  background: #ECEFF1;\n  border: 1px solid #90A4AE;\n}\n\n.apexcharts-yaxistooltip.apexcharts-theme-dark {\n  background: rgba(0, 0, 0, 0.7);\n  border: 1px solid rgba(0, 0, 0, 0.5);\n  color: #fff;\n}\n\n.apexcharts-yaxistooltip:after,\n.apexcharts-yaxistooltip:before {\n  top: 50%;\n  border: solid transparent;\n  content: " ";\n  height: 0;\n  width: 0;\n  position: absolute;\n  pointer-events: none;\n}\n\n.apexcharts-yaxistooltip:after {\n  border-color: rgba(236, 239, 241, 0);\n  border-width: 6px;\n  margin-top: -6px;\n}\n\n.apexcharts-yaxistooltip:before {\n  border-color: rgba(144, 164, 174, 0);\n  border-width: 7px;\n  margin-top: -7px;\n}\n\n.apexcharts-yaxistooltip-left:after,\n.apexcharts-yaxistooltip-left:before {\n  left: 100%;\n}\n\n.apexcharts-yaxistooltip-right:after,\n.apexcharts-yaxistooltip-right:before {\n  right: 100%;\n}\n\n.apexcharts-yaxistooltip-left:after {\n  border-left-color: #ECEFF1;\n}\n\n.apexcharts-yaxistooltip-left:before {\n  border-left-color: #90A4AE;\n}\n\n.apexcharts-yaxistooltip-left.apexcharts-theme-dark:after {\n  border-left-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-yaxistooltip-left.apexcharts-theme-dark:before {\n  border-left-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-yaxistooltip-right:after {\n  border-right-color: #ECEFF1;\n}\n\n.apexcharts-yaxistooltip-right:before {\n  border-right-color: #90A4AE;\n}\n\n.apexcharts-yaxistooltip-right.apexcharts-theme-dark:after {\n  border-right-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-yaxistooltip-right.apexcharts-theme-dark:before {\n  border-right-color: rgba(0, 0, 0, 0.5);\n}\n\n.apexcharts-yaxistooltip.apexcharts-active {\n  opacity: 1;\n}\n\n.apexcharts-yaxistooltip-hidden {\n  display: none;\n}\n\n.apexcharts-xcrosshairs,\n.apexcharts-ycrosshairs {\n  pointer-events: none;\n  opacity: 0;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-xcrosshairs.apexcharts-active,\n.apexcharts-ycrosshairs.apexcharts-active {\n  opacity: 1;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-ycrosshairs-hidden {\n  opacity: 0;\n}\n\n.apexcharts-selection-rect {\n  cursor: move;\n}\n\n.svg_select_boundingRect, .svg_select_points_rot {\n  pointer-events: none;\n  opacity: 0;\n  visibility: hidden;\n}\n.apexcharts-selection-rect + g .svg_select_boundingRect,\n.apexcharts-selection-rect + g .svg_select_points_rot {\n  opacity: 0;\n  visibility: hidden;\n}\n\n.apexcharts-selection-rect + g .svg_select_points_l,\n.apexcharts-selection-rect + g .svg_select_points_r {\n  cursor: ew-resize;\n  opacity: 1;\n  visibility: visible;\n}\n\n.svg_select_points {\n  fill: #efefef;\n  stroke: #333;\n  rx: 2;\n}\n\n.apexcharts-canvas.apexcharts-zoomable .hovering-zoom {\n  cursor: crosshair\n}\n\n.apexcharts-canvas.apexcharts-zoomable .hovering-pan {\n  cursor: move\n}\n\n.apexcharts-zoom-icon,\n.apexcharts-zoomin-icon,\n.apexcharts-zoomout-icon,\n.apexcharts-reset-icon,\n.apexcharts-pan-icon,\n.apexcharts-selection-icon,\n.apexcharts-menu-icon,\n.apexcharts-toolbar-custom-icon {\n  cursor: pointer;\n  width: 20px;\n  height: 20px;\n  line-height: 24px;\n  color: #6E8192;\n  text-align: center;\n}\n\n.apexcharts-zoom-icon svg,\n.apexcharts-zoomin-icon svg,\n.apexcharts-zoomout-icon svg,\n.apexcharts-reset-icon svg,\n.apexcharts-menu-icon svg {\n  fill: #6E8192;\n}\n\n.apexcharts-selection-icon svg {\n  fill: #444;\n  transform: scale(0.76)\n}\n\n.apexcharts-theme-dark .apexcharts-zoom-icon svg,\n.apexcharts-theme-dark .apexcharts-zoomin-icon svg,\n.apexcharts-theme-dark .apexcharts-zoomout-icon svg,\n.apexcharts-theme-dark .apexcharts-reset-icon svg,\n.apexcharts-theme-dark .apexcharts-pan-icon svg,\n.apexcharts-theme-dark .apexcharts-selection-icon svg,\n.apexcharts-theme-dark .apexcharts-menu-icon svg,\n.apexcharts-theme-dark .apexcharts-toolbar-custom-icon svg {\n  fill: #f3f4f5;\n}\n\n.apexcharts-canvas .apexcharts-zoom-icon.apexcharts-selected svg,\n.apexcharts-canvas .apexcharts-selection-icon.apexcharts-selected svg,\n.apexcharts-canvas .apexcharts-reset-zoom-icon.apexcharts-selected svg {\n  fill: #008FFB;\n}\n\n.apexcharts-theme-light .apexcharts-selection-icon:not(.apexcharts-selected):hover svg,\n.apexcharts-theme-light .apexcharts-zoom-icon:not(.apexcharts-selected):hover svg,\n.apexcharts-theme-light .apexcharts-zoomin-icon:hover svg,\n.apexcharts-theme-light .apexcharts-zoomout-icon:hover svg,\n.apexcharts-theme-light .apexcharts-reset-icon:hover svg,\n.apexcharts-theme-light .apexcharts-menu-icon:hover svg {\n  fill: #333;\n}\n\n.apexcharts-selection-icon,\n.apexcharts-menu-icon {\n  position: relative;\n}\n\n.apexcharts-reset-icon {\n  margin-left: 5px;\n}\n\n.apexcharts-zoom-icon,\n.apexcharts-reset-icon,\n.apexcharts-menu-icon {\n  transform: scale(0.85);\n}\n\n.apexcharts-zoomin-icon,\n.apexcharts-zoomout-icon {\n  transform: scale(0.7)\n}\n\n.apexcharts-zoomout-icon {\n  margin-right: 3px;\n}\n\n.apexcharts-pan-icon {\n  transform: scale(0.62);\n  position: relative;\n  left: 1px;\n  top: 0px;\n}\n\n.apexcharts-pan-icon svg {\n  fill: #fff;\n  stroke: #6E8192;\n  stroke-width: 2;\n}\n\n.apexcharts-pan-icon.apexcharts-selected svg {\n  stroke: #008FFB;\n}\n\n.apexcharts-pan-icon:not(.apexcharts-selected):hover svg {\n  stroke: #333;\n}\n\n.apexcharts-toolbar {\n  position: absolute;\n  z-index: 11;\n  max-width: 176px;\n  text-align: right;\n  border-radius: 3px;\n  padding: 0px 6px 2px 6px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.apexcharts-menu {\n  background: #fff;\n  position: absolute;\n  top: 100%;\n  border: 1px solid #ddd;\n  border-radius: 3px;\n  padding: 3px;\n  right: 10px;\n  opacity: 0;\n  min-width: 110px;\n  transition: 0.15s ease all;\n  pointer-events: none;\n}\n\n.apexcharts-menu.apexcharts-menu-open {\n  opacity: 1;\n  pointer-events: all;\n  transition: 0.15s ease all;\n}\n\n.apexcharts-menu-item {\n  padding: 6px 7px;\n  font-size: 12px;\n  cursor: pointer;\n}\n\n.apexcharts-theme-light .apexcharts-menu-item:hover {\n  background: #eee;\n}\n\n.apexcharts-theme-dark .apexcharts-menu {\n  background: rgba(0, 0, 0, 0.7);\n  color: #fff;\n}\n\n@media screen and (min-width: 768px) {\n  .apexcharts-canvas:hover .apexcharts-toolbar {\n    opacity: 1;\n  }\n}\n\n.apexcharts-datalabel.apexcharts-element-hidden {\n  opacity: 0;\n}\n\n.apexcharts-pie-label,\n.apexcharts-datalabels,\n.apexcharts-datalabel,\n.apexcharts-datalabel-label,\n.apexcharts-datalabel-value {\n  cursor: default;\n  pointer-events: none;\n}\n\n.apexcharts-pie-label-delay {\n  opacity: 0;\n  animation-name: opaque;\n  animation-duration: 0.3s;\n  animation-fill-mode: forwards;\n  animation-timing-function: ease;\n}\n\n.apexcharts-canvas .apexcharts-element-hidden {\n  opacity: 0;\n}\n\n.apexcharts-hide .apexcharts-series-points {\n  opacity: 0;\n}\n\n.apexcharts-gridline,\n.apexcharts-annotation-rect,\n.apexcharts-tooltip .apexcharts-marker,\n.apexcharts-area-series .apexcharts-area,\n.apexcharts-line,\n.apexcharts-zoom-rect,\n.apexcharts-toolbar svg,\n.apexcharts-area-series .apexcharts-series-markers .apexcharts-marker.no-pointer-events,\n.apexcharts-line-series .apexcharts-series-markers .apexcharts-marker.no-pointer-events,\n.apexcharts-radar-series path,\n.apexcharts-radar-series polygon {\n  pointer-events: none;\n}\n\n\n/* markers */\n\n.apexcharts-marker {\n  transition: 0.15s ease all;\n}\n\n@keyframes opaque {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n\n/* Resize generated styles */\n\n@keyframes resizeanim {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 0;\n  }\n}\n\n.resize-triggers {\n  animation: 1ms resizeanim;\n  visibility: hidden;\n  opacity: 0;\n}\n\n.resize-triggers,\n.resize-triggers>div,\n.contract-trigger:before {\n  content: " ";\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n}\n\n.resize-triggers>div {\n  background: #eee;\n  overflow: auto;\n}\n\n.contract-trigger:before {\n  width: 200%;\n  height: 200%;\n}'),function(){function t(t){var e=t.__resizeTriggers__,i=e.firstElementChild,a=e.lastElementChild,s=i?i.firstElementChild:null;a&&(a.scrollLeft=a.scrollWidth,a.scrollTop=a.scrollHeight),s&&(s.style.width=i.offsetWidth+1+"px",s.style.height=i.offsetHeight+1+"px"),i&&(i.scrollLeft=i.scrollWidth,i.scrollTop=i.scrollHeight);}function e(e){var i=this;t(this),this.__resizeRAF__&&r(this.__resizeRAF__),this.__resizeRAF__=s((function(){(function(t){return t.offsetWidth!=t.__resizeLast__.width||t.offsetHeight!=t.__resizeLast__.height})(i)&&(i.__resizeLast__.width=i.offsetWidth,i.__resizeLast__.height=i.offsetHeight,i.__resizeListeners__.forEach((function(t){t.call(e);})));}));}var i,a,s=(i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||function(t){return window.setTimeout(t,20)},function(t){return i(t)}),r=(a=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.clearTimeout,function(t){return a(t)}),n=!1,o="animationstart",l="Webkit Moz O ms".split(" "),h="webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(" "),c=document.createElement("fakeelement");if(void 0!==c.style.animationName&&(n=!0),!1===n)for(var d=0;d<l.length;d++)if(void 0!==c.style[l[d]+"AnimationName"]){o=h[d];break}window.addResizeListener=function(i,a){i.__resizeTriggers__||("static"==getComputedStyle(i).position&&(i.style.position="relative"),i.__resizeLast__={},i.__resizeListeners__=[],(i.__resizeTriggers__=document.createElement("div")).className="resize-triggers",i.__resizeTriggers__.innerHTML='<div class="expand-trigger"><div></div></div><div class="contract-trigger"></div>',i.appendChild(i.__resizeTriggers__),t(i),i.addEventListener("scroll",e,!0),o&&i.__resizeTriggers__.addEventListener(o,(function(e){"resizeanim"==e.animationName&&t(i);}))),i.__resizeListeners__.push(a);},window.removeResizeListener=function(t,i){t&&(t.__resizeListeners__.splice(t.__resizeListeners__.indexOf(i),1),t.__resizeListeners__.length||(t.removeEventListener("scroll",e),t.__resizeTriggers__.parentNode&&(t.__resizeTriggers__=!t.removeChild(t.__resizeTriggers__))));};}(),window.Apex={};var It=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"initModules",value:function(){this.ctx.publicMethods=["updateOptions","updateSeries","appendData","appendSeries","toggleSeries","showSeries","hideSeries","setLocale","resetSeries","zoomX","toggleDataPointSelection","dataURI","addXaxisAnnotation","addYaxisAnnotation","addPointAnnotation","clearAnnotations","removeAnnotation","paper","destroy"],this.ctx.eventList=["click","mousedown","mousemove","touchstart","touchmove","mouseup","touchend"],this.ctx.animations=new f(this.ctx),this.ctx.axes=new J(this.ctx),this.ctx.core=new Tt(this.ctx.el,this.ctx),this.ctx.config=new D({}),this.ctx.data=new O(this.ctx),this.ctx.grid=new _(this.ctx),this.ctx.graphics=new p(this.ctx),this.ctx.coreUtils=new m(this.ctx),this.ctx.crosshairs=new Q(this.ctx),this.ctx.events=new Z(this.ctx),this.ctx.exports=new V(this.ctx),this.ctx.localization=new $(this.ctx),this.ctx.options=new S,this.ctx.responsive=new K(this.ctx),this.ctx.series=new M(this.ctx),this.ctx.theme=new tt(this.ctx),this.ctx.formatters=new W(this.ctx),this.ctx.titleSubtitle=new et(this.ctx),this.ctx.legend=new lt(this.ctx),this.ctx.toolbar=new ht(this.ctx),this.ctx.dimensions=new nt(this.ctx),this.ctx.updateHelpers=new zt(this.ctx),this.ctx.zoomPanSelection=new ct(this.ctx),this.ctx.w.globals.tooltip=new bt(this.ctx);}}]),t}(),Mt=function(){function t(i){e(this,t),this.ctx=i,this.w=i.w;}return a(t,[{key:"clear",value:function(){this.ctx.zoomPanSelection&&this.ctx.zoomPanSelection.destroy(),this.ctx.toolbar&&this.ctx.toolbar.destroy(),this.ctx.animations=null,this.ctx.axes=null,this.ctx.annotations=null,this.ctx.core=null,this.ctx.data=null,this.ctx.grid=null,this.ctx.series=null,this.ctx.responsive=null,this.ctx.theme=null,this.ctx.formatters=null,this.ctx.titleSubtitle=null,this.ctx.legend=null,this.ctx.dimensions=null,this.ctx.options=null,this.ctx.crosshairs=null,this.ctx.zoomPanSelection=null,this.ctx.updateHelpers=null,this.ctx.toolbar=null,this.ctx.localization=null,this.ctx.w.globals.tooltip=null,this.clearDomElements();}},{key:"killSVG",value:function(t){t.each((function(t,e){this.removeClass("*"),this.off(),this.stop();}),!0),t.ungroup(),t.clear();}},{key:"clearDomElements",value:function(){var t=this;this.ctx.eventList.forEach((function(e){document.removeEventListener(e,t.ctx.events.documentEvent);}));var e=this.w.globals.dom;if(null!==this.ctx.el)for(;this.ctx.el.firstChild;)this.ctx.el.removeChild(this.ctx.el.firstChild);this.killSVG(e.Paper),e.Paper.remove(),e.elWrap=null,e.elGraphical=null,e.elAnnotations=null,e.elLegendWrap=null,e.baseEl=null,e.elGridRect=null,e.elGridRectMask=null,e.elGridRectMarkerMask=null,e.elDefs=null;}}]),t}(),Et=function(){function t(i,a){e(this,t),this.opts=a,this.ctx=this,this.w=new N(a).init(),this.el=i,this.w.globals.cuid=g.randomId(),this.w.globals.chartID=this.w.config.chart.id?this.w.config.chart.id:this.w.globals.cuid,new It(this).initModules(),this.create=g.bind(this.create,this),this.windowResizeHandler=this._windowResize.bind(this);}return a(t,[{key:"render",value:function(){var t=this;return new Promise((function(e,i){if(null!==t.el){void 0===Apex._chartInstances&&(Apex._chartInstances=[]),t.w.config.chart.id&&Apex._chartInstances.push({id:t.w.globals.chartID,group:t.w.config.chart.group,chart:t}),t.setLocale(t.w.config.chart.defaultLocale);var a=t.w.config.chart.events.beforeMount;"function"==typeof a&&a(t,t.w),t.events.fireEvent("beforeMount",[t,t.w]),window.addEventListener("resize",t.windowResizeHandler),window.addResizeListener(t.el.parentNode,t._parentResizeCallback.bind(t));var s=t.create(t.w.config.series,{});if(!s)return e(t);t.mount(s).then((function(){"function"==typeof t.w.config.chart.events.mounted&&t.w.config.chart.events.mounted(t,t.w),t.events.fireEvent("mounted",[t,t.w]),e(s);})).catch((function(t){i(t);}));}else i(new Error("Element not found"));}))}},{key:"create",value:function(t,e){var i=this.w;new It(this).initModules();var a=this.w.globals;(a.noData=!1,a.animationEnded=!1,this.responsive.checkResponsiveConfig(e),i.config.xaxis.convertedCatToNumeric)&&new R(i.config).convertCatToNumericXaxis(i.config,this.ctx);if(null===this.el)return a.animationEnded=!0,null;if(this.core.setupElements(),0===a.svgWidth)return a.animationEnded=!0,null;var s=m.checkComboSeries(t);a.comboCharts=s.comboCharts,a.comboBarCount=s.comboBarCount;var r=t.every((function(t){return t.data&&0===t.data.length}));(0===t.length||r)&&this.series.handleNoData(),this.events.setupEventHandlers(),this.data.parseData(t),this.theme.init(),new P(this).setGlobalMarkerSize(),this.formatters.setLabelFormatters(),this.titleSubtitle.draw(),a.noData&&a.collapsedSeries.length!==a.series.length&&!i.config.legend.showForSingleSeries||this.legend.init(),this.series.hasAllSeriesEqualX(),a.axisCharts&&(this.core.coreCalculations(),"category"!==i.config.xaxis.type&&this.formatters.setLabelFormatters()),this.formatters.heatmapLabelFormatters(),this.dimensions.plotCoords();var n=this.core.xySettings();this.grid.createGridMask();var o=this.core.plotChartType(t,n),l=new z(this);l.bringForward(),i.config.dataLabels.background.enabled&&l.dataLabelsBackground(),this.core.shiftGraphPosition();var h={plot:{left:i.globals.translateX,top:i.globals.translateY,width:i.globals.gridWidth,height:i.globals.gridHeight}};return {elGraph:o,xyRatios:n,elInner:i.globals.dom.elGraphical,dimensions:h}}},{key:"mount",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=this,a=i.w;return new Promise((function(s,r){if(null===i.el)return r(new Error("Not enough data to display or target element not found"));(null===e||a.globals.allSeriesCollapsed)&&i.series.handleNoData(),i.axes.drawAxis(a.config.chart.type,e.xyRatios),i.grid=new _(i);var n=i.grid.drawGrid();i.annotations=new C(i),i.annotations.drawShapeAnnos(),i.annotations.drawImageAnnos(),i.annotations.drawTextAnnos(),"back"===a.config.grid.position&&n&&a.globals.dom.elGraphical.add(n.el);var o=new G(t.ctx),l=new q(t.ctx);if(null!==n&&(o.xAxisLabelCorrections(n.xAxisTickWidth),l.setYAxisTextAlignments()),"back"===a.config.annotations.position&&(a.globals.dom.Paper.add(a.globals.dom.elAnnotations),i.annotations.drawAxesAnnotations()),e.elGraph instanceof Array)for(var h=0;h<e.elGraph.length;h++)a.globals.dom.elGraphical.add(e.elGraph[h]);else a.globals.dom.elGraphical.add(e.elGraph);if("front"===a.config.grid.position&&n&&a.globals.dom.elGraphical.add(n.el),"front"===a.config.xaxis.crosshairs.position&&i.crosshairs.drawXCrosshairs(),"front"===a.config.yaxis[0].crosshairs.position&&i.crosshairs.drawYCrosshairs(),"front"===a.config.annotations.position&&(a.globals.dom.Paper.add(a.globals.dom.elAnnotations),i.annotations.drawAxesAnnotations()),!a.globals.noData){if(a.config.tooltip.enabled&&!a.globals.noData&&i.w.globals.tooltip.drawTooltip(e.xyRatios),a.globals.axisCharts&&(a.globals.isXNumeric||a.config.xaxis.convertedCatToNumeric))(a.config.chart.zoom.enabled||a.config.chart.selection&&a.config.chart.selection.enabled||a.config.chart.pan&&a.config.chart.pan.enabled)&&i.zoomPanSelection.init({xyRatios:e.xyRatios});else {var c=a.config.chart.toolbar.tools;["zoom","zoomin","zoomout","selection","pan","reset"].forEach((function(t){c[t]=!1;}));}a.config.chart.toolbar.show&&!a.globals.allSeriesCollapsed&&i.toolbar.createToolbar();}a.globals.memory.methodsToExec.length>0&&a.globals.memory.methodsToExec.forEach((function(t){t.method(t.params,!1,t.context);})),a.globals.axisCharts||a.globals.noData||i.core.resizeNonAxisCharts(),s(i);}))}},{key:"destroy",value:function(){window.removeEventListener("resize",this.windowResizeHandler),window.removeResizeListener(this.el.parentNode,this._parentResizeCallback.bind(this));var t=this.w.config.chart.id;t&&Apex._chartInstances.forEach((function(e,i){e.id===t&&Apex._chartInstances.splice(i,1);})),new Mt(this.ctx).clear();}},{key:"updateOptions",value:function(t){var e=this,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],s=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=!(arguments.length>4&&void 0!==arguments[4])||arguments[4],n=this.w;return n.globals.selection=void 0,t.series&&(this.series.resetSeries(!1,!0,!1),t.series.length&&t.series[0].data&&(t.series=t.series.map((function(t,i){return e.updateHelpers._extendSeries(t,i)}))),this.updateHelpers.revertDefaultAxisMinMax()),t.xaxis&&(t=this.updateHelpers.forceXAxisUpdate(t)),t.yaxis&&(t=this.updateHelpers.forceYAxisUpdate(t)),n.globals.collapsedSeriesIndices.length>0&&this.series.clearPreviousPaths(),t.theme&&(t=this.theme.updateThemeOptions(t)),this.updateHelpers._updateOptions(t,i,a,s,r)}},{key:"updateSeries",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return this.series.resetSeries(!1),this.updateHelpers.revertDefaultAxisMinMax(),this.updateHelpers._updateSeries(t,e,i)}},{key:"appendSeries",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],a=this.w.config.series.slice();return a.push(t),this.series.resetSeries(!1),this.updateHelpers.revertDefaultAxisMinMax(),this.updateHelpers._updateSeries(a,e,i)}},{key:"appendData",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=this;i.w.globals.dataChanged=!0,i.series.getPreviousPaths();for(var a=i.w.config.series.slice(),s=0;s<a.length;s++)if(null!==t[s]&&void 0!==t[s])for(var r=0;r<t[s].data.length;r++)a[s].data.push(t[s].data[r]);return i.w.config.series=a,e&&(i.w.globals.initialSeries=JSON.parse(JSON.stringify(i.w.config.series))),this.update()}},{key:"update",value:function(t){var e=this;return new Promise((function(i,a){new Mt(e.ctx).clear();var s=e.create(e.w.config.series,t);if(!s)return i(e);e.mount(s).then((function(){"function"==typeof e.w.config.chart.events.updated&&e.w.config.chart.events.updated(e,e.w),e.events.fireEvent("updated",[e,e.w]),e.w.globals.isDirty=!0,i(e);})).catch((function(t){a(t);}));}))}},{key:"getSyncedCharts",value:function(){var t=this.getGroupedCharts(),e=[this];return t.length&&(e=[],t.forEach((function(t){e.push(t);}))),e}},{key:"getGroupedCharts",value:function(){var t=this;return Apex._chartInstances.filter((function(t){if(t.group)return !0})).map((function(e){return t.w.config.chart.group===e.group?e.chart:t}))}},{key:"toggleSeries",value:function(t){return this.series.toggleSeries(t)}},{key:"showSeries",value:function(t){this.series.showSeries(t);}},{key:"hideSeries",value:function(t){this.series.hideSeries(t);}},{key:"resetSeries",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.series.resetSeries(t,e);}},{key:"addEventListener",value:function(t,e){this.events.addEventListener(t,e);}},{key:"removeEventListener",value:function(t,e){this.events.removeEventListener(t,e);}},{key:"addXaxisAnnotation",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,a=this;i&&(a=i),a.annotations.addXaxisAnnotationExternal(t,e,a);}},{key:"addYaxisAnnotation",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,a=this;i&&(a=i),a.annotations.addYaxisAnnotationExternal(t,e,a);}},{key:"addPointAnnotation",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,a=this;i&&(a=i),a.annotations.addPointAnnotationExternal(t,e,a);}},{key:"clearAnnotations",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0,e=this;t&&(e=t),e.annotations.clearAnnotations(e);}},{key:"removeAnnotation",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,i=this;e&&(i=e),i.annotations.removeAnnotation(i,t);}},{key:"getChartArea",value:function(){return this.w.globals.dom.baseEl.querySelector(".apexcharts-inner")}},{key:"getSeriesTotalXRange",value:function(t,e){return this.coreUtils.getSeriesTotalsXRange(t,e)}},{key:"getHighestValueInSeries",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=new U(this.ctx);return e.getMinYMaxY(t).highestY}},{key:"getLowestValueInSeries",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=new U(this.ctx);return e.getMinYMaxY(t).lowestY}},{key:"getSeriesTotal",value:function(){return this.w.globals.seriesTotals}},{key:"toggleDataPointSelection",value:function(t,e){return this.updateHelpers.toggleDataPointSelection(t,e)}},{key:"zoomX",value:function(t,e){this.ctx.toolbar.zoomUpdateOptions(t,e);}},{key:"setLocale",value:function(t){this.localization.setCurrentLocaleValues(t);}},{key:"dataURI",value:function(){return new V(this.ctx).dataURI()}},{key:"paper",value:function(){return this.w.globals.dom.Paper}},{key:"_parentResizeCallback",value:function(){!this.w.globals.noData&&this.w.globals.animationEnded&&this.w.config.chart.redrawOnParentResize&&this._windowResize();}},{key:"_windowResize",value:function(){var t=this;clearTimeout(this.w.globals.resizeTimer),this.w.globals.resizeTimer=window.setTimeout((function(){t.w.globals.resized=!0,t.w.globals.dataChanged=!1,t.ctx.update();}),150);}}],[{key:"getChartByID",value:function(t){var e=Apex._chartInstances.filter((function(e){return e.id===t}))[0];return e&&e.chart}},{key:"initOnLoad",value:function(){for(var e=document.querySelectorAll("[data-apexcharts]"),i=0;i<e.length;i++){new t(e[i],JSON.parse(e[i].getAttribute("data-options"))).render();}}},{key:"exec",value:function(t,e){var i=this.getChartByID(t);if(i){i.w.globals.isExecCalled=!0;var a=null;if(-1!==i.publicMethods.indexOf(e)){for(var s=arguments.length,r=new Array(s>2?s-2:0),n=2;n<s;n++)r[n-2]=arguments[n];a=i[e].apply(i,r);}return a}}},{key:"merge",value:function(t,e){return g.extend(t,e)}}]),t}();

    /* src\front\GUI1SPC\HighChart.svelte generated by Svelte v3.22.3 */

    const { console: console_1$2 } = globals;

    const file$9 = "src\\front\\GUI1SPC\\HighChart.svelte";

    // (223:4) <Button color="success" on:click="{getSPCLoadInitialData}">
    function create_default_slot_1$2(ctx) {
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
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(223:4) <Button color=\\\"success\\\" on:click=\\\"{getSPCLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (226:4) <Button color="danger" on:click="{deleteSPCALL}">
    function create_default_slot$3(ctx) {
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(226:4) <Button color=\\\"danger\\\" on:click=\\\"{deleteSPCALL}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let script4;
    	let script4_src_value;
    	let script5;
    	let script5_src_value;
    	let t0;
    	let main;
    	let h1;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let current;
    	let dispose;

    	const button0 = new Button({
    			props: {
    				color: "success",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getSPCLoadInitialData*/ ctx[0]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteSPCALL*/ ctx[1]);

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			script4 = element("script");
    			script5 = element("script");
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "SPC Manager";
    			t2 = space();
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			div = element("div");
    			if (script0.src !== (script0_src_value = "https://cdn.jsdelivr.net/npm/apexcharts")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$9, 212, 4, 6285);
    			if (script1.src !== (script1_src_value = "apex.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$9, 213, 4, 6383);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$9, 214, 4, 6420);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/highcharts-more.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$9, 215, 4, 6491);
    			if (script4.src !== (script4_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script4, "src", script4_src_value);
    			add_location(script4, file$9, 216, 4, 6567);
    			if (script5.src !== (script5_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script5, "src", script5_src_value);
    			add_location(script5, file$9, 217, 4, 6645);
    			add_location(h1, file$9, 221, 4, 6776);
    			attr_dev(div, "id", "container");
    			set_style(div, "height", "1000");
    			set_style(div, "min-width", "310px");
    			set_style(div, "max-width", "800px");
    			set_style(div, "margin", "100px");
    			add_location(div, file$9, 228, 4, 7011);
    			add_location(main, file$9, 219, 0, 6762);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			append_dev(document.head, script4);
    			append_dev(document.head, script5);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			mount_component(button0, main, null);
    			append_dev(main, t3);
    			mount_component(button1, main, null);
    			append_dev(main, t4);
    			append_dev(main, div);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(script5, "load", loadGraphs$1, false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			detach_dev(script4);
    			detach_dev(script5);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			destroy_component(button1);
    			dispose();
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

    async function loadGraphs$1() {
    	let MyData = [];
    	const resData = await fetch("/api/v2/spc-stats");
    	MyData = await resData.json();

    	var euro = MyData.filter(function (el) {
    		return el.continent == "europe" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	var asia = MyData.filter(function (el) {
    		return el.continent == "asia" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	var africa = MyData.filter(function (el) {
    		return el.continent == "africa" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	var south = MyData.filter(function (el) {
    		return el.continent == "south america" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	var north = MyData.filter(function (el) {
    		return el.continent == "north america" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	var oceania = MyData.filter(function (el) {
    		return el.continent == "oceania" && el.year == 2013;
    	}).map(dato => {
    		return {
    			"name": dato.country,
    			"value": dato.both_sex
    		};
    	});

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "100%" },
    		title: {
    			text: "Suicidios por cada 100,000 personas en 2013 "
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					gravitationalConstant: 0.05,
    					splitSeries: true,
    					seriesInteraction: false,
    					dragBetweenSeries: true,
    					parentNodeLimit: true
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: [
    			{ name: "Europe", data: euro },
    			{ name: "Africa", data: africa },
    			{ name: "Oceania", data: oceania },
    			{ name: "North America", data: north },
    			{ name: "South America", data: south },
    			{ name: "Asia", data: asia }
    		]
    	});
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let spc = [];
    	let errorMSG = "";
    	onMount(getSPC);

    	//GET INITIALDATA
    	async function getSPCLoadInitialData() {
    		console.log("Fetching spc...");
    		await fetch("/api/v2/spc-stats/loadInitialData");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
    		loadGraphs$1();

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			spc = json;
    			totaldata = 12;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			errorMSG = res.status + ": " + res.statusText;
    			console.log("ERROR!");
    		}
    	}

    	//DELETE ALL
    	async function deleteSPCALL() {
    		const res = await fetch("/api/v2/spc-stats/", { method: "DELETE" }).then(function (res) {
    			loadGraphs$1();
    			visible = true;

    			if (res.status == 200) {
    				totaldata = 0;
    				color = "success";
    				errorMSG = "Objetos borrados correctamente";
    				console.log("Deleted all spc.");
    			} else if (res.status == 400) {
    				color = "danger";
    				errorMSG = "Ha ocurrido un fallo";
    				console.log("BAD REQUEST");
    			} else {
    				color = "danger";
    				errorMSG = res.status + ": " + res.statusText;
    				console.log("ERROR!");
    			}
    		});
    	}

    	//GET
    	async function getSPC() {
    		console.log("Fetching spc...");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
    		loadGraphs$1();

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			spc = json;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			errorMSG = res.status + ": " + res.statusText;
    			console.log("ERROR!");
    		}
    	}

    	
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<HighChart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HighChart", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		ApexCharts: Et,
    		spc,
    		errorMSG,
    		getSPCLoadInitialData,
    		deleteSPCALL,
    		getSPC,
    		loadGraphs: loadGraphs$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("color" in $$props) color = $$props.color;
    		if ("spc" in $$props) spc = $$props.spc;
    		if ("errorMSG" in $$props) errorMSG = $$props.errorMSG;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSPCLoadInitialData, deleteSPCALL];
    }

    class HighChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HighChart",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\front\GUI1SPC\ApexChart.svelte generated by Svelte v3.22.3 */

    const { console: console_1$3, document: document_1 } = globals;
    const file$a = "src\\front\\GUI1SPC\\ApexChart.svelte";

    // (132:4) <Button color="success" on:click="{getSPCLoadInitialData}">
    function create_default_slot_1$3(ctx) {
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
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(132:4) <Button color=\\\"success\\\" on:click=\\\"{getSPCLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (135:4) <Button color="danger" on:click="{deleteSPCALL}">
    function create_default_slot$4(ctx) {
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
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(135:4) <Button color=\\\"danger\\\" on:click=\\\"{deleteSPCALL}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let main;
    	let h1;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let current;
    	let dispose;

    	const button0 = new Button({
    			props: {
    				color: "success",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*getSPCLoadInitialData*/ ctx[0]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteSPCALL*/ ctx[1]);

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "SPC Manager";
    			t2 = space();
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			div = element("div");
    			div.textContent = "Suicidios por cada 100,000 personas";
    			if (script.src !== (script_src_value = "https://cdn.jsdelivr.net/npm/apexcharts")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$a, 126, 4, 3416);
    			add_location(h1, file$a, 130, 4, 3532);
    			attr_dev(div, "id", "chart");
    			set_style(div, "text-align", "center");
    			attr_dev(div, "class", "svelte-jx8xh2");
    			add_location(div, file$a, 137, 4, 3767);
    			add_location(main, file$a, 128, 0, 3518);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document_1.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			mount_component(button0, main, null);
    			append_dev(main, t3);
    			mount_component(button1, main, null);
    			append_dev(main, t4);
    			append_dev(main, div);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(script, "load", /*loadGraphs*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			destroy_component(button1);
    			dispose();
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
    	let spc = [];
    	let errorMSG = "";
    	onMount(getSPC);

    	//GET INITIALDATA
    	async function getSPCLoadInitialData() {
    		console.log("Fetching spc...");
    		await fetch("/api/v2/spc-stats/loadInitialData");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
    		loadGraphs();

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			spc = json;
    			totaldata = 12;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			errorMSG = res.status + ": " + res.statusText;
    			console.log("ERROR!");
    		}
    	}

    	//DELETE ALL
    	async function deleteSPCALL() {
    		const res = await fetch("/api/v2/spc-stats/", { method: "DELETE" }).then(function (res) {
    			loadGraphs();
    			visible = true;

    			if (res.status == 200) {
    				totaldata = 0;
    				color = "success";
    				errorMSG = "Objetos borrados correctamente";
    				console.log("Deleted all spc.");
    			} else if (res.status == 400) {
    				color = "danger";
    				errorMSG = "Ha ocurrido un fallo";
    				console.log("BAD REQUEST");
    			} else {
    				color = "danger";
    				errorMSG = res.status + ": " + res.statusText;
    				console.log("ERROR!");
    			}
    		});
    	}

    	//GET
    	async function getSPC() {
    		console.log("Fetching spc...");
    		const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			spc = json;
    			console.log("Received " + spc.length + " spc.");
    		} else {
    			errorMSG = res.status + ": " + res.statusText;
    			console.log("ERROR!");
    		}
    	}

    	async function loadGraphs() {
    		let MyData = [];
    		const resData = await fetch("/api/v2/spc-stats");
    		MyData = spc;
    		var mujeres = MyData.map(dato => dato.female_number);
    		var hombres = MyData.map(dato => dato.male_number);

    		var paises = MyData.map(dato => {
    			return dato.country;
    		});

    		var options = {
    			series: [{ name: "Hombres", data: hombres }, { name: "Mujeres", data: mujeres }],
    			chart: { height: 550, type: "area" },
    			dataLabels: { enabled: true },
    			stroke: { curve: "smooth" },
    			xaxis: { type: "category", categories: paises }
    		};

    		var chart = new Et(document.querySelector("#chart"), options);
    		chart.render();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<ApexChart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ApexChart", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		spc,
    		ApexCharts: Et,
    		errorMSG,
    		getSPCLoadInitialData,
    		deleteSPCALL,
    		getSPC,
    		loadGraphs
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("color" in $$props) color = $$props.color;
    		if ("spc" in $$props) spc = $$props.spc;
    		if ("errorMSG" in $$props) errorMSG = $$props.errorMSG;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSPCLoadInitialData, deleteSPCALL, loadGraphs];
    }

    class ApexChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ApexChart",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\front\GUI1SPC\EditSpc.svelte generated by Svelte v3.22.3 */

    const { console: console_1$4 } = globals;
    const file$b = "src\\front\\GUI1SPC\\EditSpc.svelte";

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

    // (109:4) {:then spc}
    function create_then_block$1(ctx) {
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
    				responsive: true,
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
    		id: create_then_block$1.name,
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
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
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
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(141:25) <Button outline  color=\\\"primary\\\" on:click={updateSpc}>",
    		ctx
    	});

    	return block;
    }

    // (115:8) <Table bordered responsive>
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
    				$$slots: { default: [create_default_slot_2$2] },
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
    			add_location(th0, file$b, 117, 20, 3780);
    			add_location(th1, file$b, 118, 20, 3818);
    			add_location(th2, file$b, 119, 20, 3857);
    			add_location(th3, file$b, 120, 20, 3897);
    			add_location(th4, file$b, 121, 20, 3939);
    			add_location(th5, file$b, 122, 20, 3981);
    			add_location(th6, file$b, 123, 20, 4025);
    			add_location(th7, file$b, 124, 20, 4061);
    			add_location(th8, file$b, 125, 20, 4096);
    			add_location(th9, file$b, 126, 20, 4136);
    			add_location(tr0, file$b, 116, 16, 3754);
    			add_location(thead, file$b, 115, 12, 3729);
    			add_location(td0, file$b, 131, 20, 4262);
    			add_location(input0, file$b, 132, 24, 4313);
    			add_location(td1, file$b, 132, 20, 4309);
    			add_location(input1, file$b, 133, 24, 4381);
    			add_location(td2, file$b, 133, 20, 4377);
    			add_location(input2, file$b, 134, 24, 4450);
    			add_location(td3, file$b, 134, 20, 4446);
    			add_location(input3, file$b, 135, 24, 4521);
    			add_location(td4, file$b, 135, 20, 4517);
    			add_location(input4, file$b, 136, 24, 4592);
    			add_location(td5, file$b, 136, 20, 4588);
    			add_location(input5, file$b, 137, 24, 4665);
    			add_location(td6, file$b, 137, 20, 4661);
    			add_location(td7, file$b, 138, 20, 4727);
    			add_location(input6, file$b, 139, 24, 4775);
    			add_location(td8, file$b, 139, 20, 4771);
    			add_location(td9, file$b, 140, 20, 4841);
    			add_location(tr1, file$b, 130, 16, 4236);
    			add_location(tbody, file$b, 129, 12, 4211);
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
    		source: "(115:8) <Table bordered responsive>",
    		ctx
    	});

    	return block;
    }

    // (107:16)           Loading spc...      {:then spc}
    function create_pending_block$1(ctx) {
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
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(107:16)           Loading spc...      {:then spc}",
    		ctx
    	});

    	return block;
    }

    // (146:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		source: "(146:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
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
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 13,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*spc*/ ctx[13], info);

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
    			add_location(h1, file$b, 104, 4, 3381);
    			add_location(strong, file$b, 105, 17, 3420);
    			add_location(h3, file$b, 105, 4, 3407);
    			add_location(main, file$b, 103, 0, 3369);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditSpc",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get params() {
    		throw new Error("<EditSpc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditSpc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI2POVERTY\Home.svelte generated by Svelte v3.22.3 */

    const { console: console_1$5 } = globals;
    const file$c = "src\\front\\GUI2POVERTY\\Home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
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

    // (261:4) {:then poverty}
    function create_then_block$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let if_block1_anchor;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[1],
    				isOpen: /*visible*/ ctx[0],
    				toggle: /*func*/ ctx[18],
    				$$slots: { default: [create_default_slot_11$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table0 = new Table({
    			props: {
    				responsive: true,
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table1 = new Table({
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

    	button0.$on("click", /*getPovertyLoadInitialData*/ ctx[11]);

    	const button1 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deletePovertyAll*/ ctx[15]);
    	let if_block0 = /*page*/ ctx[7] != 1 && /*busqueda*/ ctx[4] == false && create_if_block_1$2(ctx);
    	let if_block1 = /*page*/ ctx[7] + 10 <= /*totalObj*/ ctx[6] && /*busqueda*/ ctx[4] == false && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t0 = space();
    			create_component(table0.$$.fragment);
    			t1 = space();
    			create_component(table1.$$.fragment);
    			t2 = space();
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(table0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(table1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};
    			if (dirty & /*color*/ 2) alert_changes.color = /*color*/ ctx[1];
    			if (dirty & /*visible*/ 1) alert_changes.isOpen = /*visible*/ ctx[0];
    			if (dirty & /*visible*/ 1) alert_changes.toggle = /*func*/ ctx[18];

    			if (dirty & /*$$scope, errorMSG*/ 536871168) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table0_changes = {};

    			if (dirty & /*$$scope, busqueda, countryValue, yearValue*/ 536870940) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const table1_changes = {};

    			if (dirty & /*$$scope, poverty, newPoverty, busqueda*/ 536871472) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
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

    			if (/*page*/ ctx[7] != 1 && /*busqueda*/ ctx[4] == false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*page, busqueda*/ 144) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t5.parentNode, t5);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[7] + 10 <= /*totalObj*/ ctx[6] && /*busqueda*/ ctx[4] == false) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*page, totalObj, busqueda*/ 208) {
    						transition_in(if_block1, 1);
    					}
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
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(table1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(261:4) {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (264:8) {#if errorMSG}
    function create_if_block_4(ctx) {
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(264:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (263:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_11$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[8] && create_if_block_4(ctx);

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
    					if_block = create_if_block_4(ctx);
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
    		id: create_default_slot_11$1.name,
    		type: "slot",
    		source: "(263:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (277:20) <Button outline color="info" on:click="{searchPoverty(countryValue, yearValue)}" style="margin-left: 2%;">
    function create_default_slot_10$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
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
    		id: create_default_slot_10$1.name,
    		type: "slot",
    		source: "(277:20) <Button outline color=\\\"info\\\" on:click=\\\"{searchPoverty(countryValue, yearValue)}\\\" style=\\\"margin-left: 2%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (280:20) {#if busqueda==true}
    function create_if_block_3$1(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "info",
    				style: "margin-left: 2%;",
    				$$slots: { default: [create_default_slot_9$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*getPoverty*/ ctx[10]);

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
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(280:20) {#if busqueda==true}",
    		ctx
    	});

    	return block;
    }

    // (281:20) <Button outline color="info" on:click="{getPoverty}" style="margin-left: 2%;">
    function create_default_slot_9$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reiniciar filtro");
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
    		id: create_default_slot_9$1.name,
    		type: "slot",
    		source: "(281:20) <Button outline color=\\\"info\\\" on:click=\\\"{getPoverty}\\\" style=\\\"margin-left: 2%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (268:8) <Table responsive>
    function create_default_slot_8$1(ctx) {
    	let thead;
    	let th;
    	let t1;
    	let tbody;
    	let tr;
    	let t2;
    	let input0;
    	let t3;
    	let input1;
    	let t4;
    	let t5;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "info",
    				style: "margin-left: 2%;",
    				$$slots: { default: [create_default_slot_10$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*searchPoverty*/ ctx[13](/*countryValue*/ ctx[2], /*yearValue*/ ctx[3]))) /*searchPoverty*/ ctx[13](/*countryValue*/ ctx[2], /*yearValue*/ ctx[3]).apply(this, arguments);
    	});

    	let if_block = /*busqueda*/ ctx[4] == true && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			th = element("th");
    			th.textContent = "Búsquedas";
    			t1 = space();
    			tbody = element("tbody");
    			tr = element("tr");
    			t2 = text("Country: ");
    			input0 = element("input");
    			t3 = text(" Year: ");
    			input1 = element("input");
    			t4 = space();
    			create_component(button.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(th, file$c, 269, 16, 8689);
    			add_location(thead, file$c, 268, 12, 8664);
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$c, 274, 29, 8825);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$c, 274, 83, 8879);
    			add_location(tr, file$c, 272, 16, 8768);
    			add_location(tbody, file$c, 271, 12, 8743);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, th);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, t2);
    			append_dev(tr, input0);
    			set_input_value(input0, /*countryValue*/ ctx[2]);
    			append_dev(tr, t3);
    			append_dev(tr, input1);
    			set_input_value(input1, /*yearValue*/ ctx[3]);
    			append_dev(tr, t4);
    			mount_component(button, tr, null);
    			append_dev(tr, t5);
    			if (if_block) if_block.m(tr, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[20])
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*countryValue*/ 4 && input0.value !== /*countryValue*/ ctx[2]) {
    				set_input_value(input0, /*countryValue*/ ctx[2]);
    			}

    			if (dirty & /*yearValue*/ 8 && input1.value !== /*yearValue*/ ctx[3]) {
    				set_input_value(input1, /*yearValue*/ ctx[3]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*busqueda*/ ctx[4] == true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*busqueda*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(tr, null);
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
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(268:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (301:16) {#if busqueda==false}
    function create_if_block_2$2(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let td2;
    	let input2;
    	let t2;
    	let td3;
    	let input3;
    	let t3;
    	let td4;
    	let input4;
    	let t4;
    	let td5;
    	let input5;
    	let t5;
    	let td6;
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

    	button.$on("click", /*insertPoverty*/ ctx[12]);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t2 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t3 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t4 = space();
    			td5 = element("td");
    			input5 = element("input");
    			t5 = space();
    			td6 = element("td");
    			create_component(button.$$.fragment);
    			add_location(input0, file$c, 302, 24, 9908);
    			add_location(td0, file$c, 302, 20, 9904);
    			add_location(input1, file$c, 303, 24, 9980);
    			add_location(td1, file$c, 303, 20, 9976);
    			add_location(input2, file$c, 304, 24, 10054);
    			add_location(td2, file$c, 304, 20, 10050);
    			add_location(input3, file$c, 305, 24, 10128);
    			add_location(td3, file$c, 305, 20, 10124);
    			add_location(input4, file$c, 306, 24, 10202);
    			add_location(td4, file$c, 306, 20, 10198);
    			add_location(input5, file$c, 307, 24, 10271);
    			add_location(td5, file$c, 307, 20, 10267);
    			add_location(td6, file$c, 308, 20, 10341);
    			add_location(tr, file$c, 301, 16, 9878);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newPoverty*/ ctx[5].country);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newPoverty*/ ctx[5].under_190);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newPoverty*/ ctx[5].under_320);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newPoverty*/ ctx[5].under_550);
    			append_dev(tr, t3);
    			append_dev(tr, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newPoverty*/ ctx[5].year);
    			append_dev(tr, t4);
    			append_dev(tr, td5);
    			append_dev(td5, input5);
    			set_input_value(input5, /*newPoverty*/ ctx[5].continent);
    			append_dev(tr, t5);
    			append_dev(tr, td6);
    			mount_component(button, td6, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[21]),
    				listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[22]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[23]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[24]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[25]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[26])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newPoverty*/ 32 && input0.value !== /*newPoverty*/ ctx[5].country) {
    				set_input_value(input0, /*newPoverty*/ ctx[5].country);
    			}

    			if (dirty & /*newPoverty*/ 32 && input1.value !== /*newPoverty*/ ctx[5].under_190) {
    				set_input_value(input1, /*newPoverty*/ ctx[5].under_190);
    			}

    			if (dirty & /*newPoverty*/ 32 && input2.value !== /*newPoverty*/ ctx[5].under_320) {
    				set_input_value(input2, /*newPoverty*/ ctx[5].under_320);
    			}

    			if (dirty & /*newPoverty*/ 32 && input3.value !== /*newPoverty*/ ctx[5].under_550) {
    				set_input_value(input3, /*newPoverty*/ ctx[5].under_550);
    			}

    			if (dirty & /*newPoverty*/ 32 && input4.value !== /*newPoverty*/ ctx[5].year) {
    				set_input_value(input4, /*newPoverty*/ ctx[5].year);
    			}

    			if (dirty & /*newPoverty*/ 32 && input5.value !== /*newPoverty*/ ctx[5].continent) {
    				set_input_value(input5, /*newPoverty*/ ctx[5].continent);
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
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(301:16) {#if busqueda==false}",
    		ctx
    	});

    	return block;
    }

    // (309:25) <Button outline  color="primary" on:click={insertPoverty}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insertar");
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
    		source: "(309:25) <Button outline  color=\\\"primary\\\" on:click={insertPoverty}>",
    		ctx
    	});

    	return block;
    }

    // (320:28) <Button outline color="danger" on:click="{deletePoverty(poverty.country)}">
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Eliminar");
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
    		source: "(320:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deletePoverty(poverty.country)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (312:16) {#each poverty as poverty}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*poverty*/ ctx[9].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*poverty*/ ctx[9].under_190 + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*poverty*/ ctx[9].under_320 + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*poverty*/ ctx[9].under_550 + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*poverty*/ ctx[9].year + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*poverty*/ ctx[9].continent + "";
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
    		if (is_function(/*deletePoverty*/ ctx[14](/*poverty*/ ctx[9].country))) /*deletePoverty*/ ctx[14](/*poverty*/ ctx[9].country).apply(this, arguments);
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
    			attr_dev(a, "href", a_href_value = "#/poverty-stats/" + /*poverty*/ ctx[9].country + "/" + /*poverty*/ ctx[9].year);
    			add_location(a, file$c, 313, 28, 10573);
    			add_location(td0, file$c, 313, 24, 10569);
    			add_location(td1, file$c, 314, 24, 10684);
    			add_location(td2, file$c, 315, 24, 10738);
    			add_location(td3, file$c, 316, 24, 10792);
    			add_location(td4, file$c, 317, 24, 10846);
    			add_location(td5, file$c, 318, 24, 10895);
    			add_location(td6, file$c, 319, 24, 10949);
    			add_location(tr, file$c, 312, 20, 10539);
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
    			if ((!current || dirty & /*poverty*/ 512) && t0_value !== (t0_value = /*poverty*/ ctx[9].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*poverty*/ 512 && a_href_value !== (a_href_value = "#/poverty-stats/" + /*poverty*/ ctx[9].country + "/" + /*poverty*/ ctx[9].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*poverty*/ 512) && t2_value !== (t2_value = /*poverty*/ ctx[9].under_190 + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*poverty*/ 512) && t4_value !== (t4_value = /*poverty*/ ctx[9].under_320 + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*poverty*/ 512) && t6_value !== (t6_value = /*poverty*/ ctx[9].under_550 + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*poverty*/ 512) && t8_value !== (t8_value = /*poverty*/ ctx[9].year + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*poverty*/ 512) && t10_value !== (t10_value = /*poverty*/ ctx[9].continent + "")) set_data_dev(t10, t10_value);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(312:16) {#each poverty as poverty}",
    		ctx
    	});

    	return block;
    }

    // (289:8) <Table responsive>
    function create_default_slot_5$1(ctx) {
    	let thead;
    	let tr;
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
    	let t12;
    	let current;
    	let if_block = /*busqueda*/ ctx[4] == false && create_if_block_2$2(ctx);
    	let each_value = /*poverty*/ ctx[9];
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
    			tr = element("tr");
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
    			if (if_block) if_block.c();
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$c, 291, 20, 9544);
    			add_location(th1, file$c, 292, 20, 9582);
    			add_location(th2, file$c, 293, 20, 9622);
    			add_location(th3, file$c, 294, 20, 9662);
    			add_location(th4, file$c, 295, 20, 9702);
    			add_location(th5, file$c, 296, 20, 9737);
    			add_location(tr, file$c, 290, 16, 9518);
    			add_location(thead, file$c, 289, 12, 9493);
    			add_location(tbody, file$c, 299, 12, 9814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			if (if_block) if_block.m(tbody, null);
    			append_dev(tbody, t12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*busqueda*/ ctx[4] == false) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*busqueda*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(tbody, t12);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*deletePoverty, poverty*/ 16896) {
    				each_value = /*poverty*/ ctx[9];
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
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
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
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(289:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (326:8) <Button color="primary" on:click="{getPovertyLoadInitialData}">
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
    		source: "(326:8) <Button color=\\\"primary\\\" on:click=\\\"{getPovertyLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (329:8) <Button color="danger" on:click="{deletePovertyAll}">
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
    		source: "(329:8) <Button color=\\\"danger\\\" on:click=\\\"{deletePovertyAll}\\\">",
    		ctx
    	});

    	return block;
    }

    // (332:8) {#if page!=1 && busqueda==false}
    function create_if_block_1$2(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*getPreviousPage*/ ctx[17]);

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
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(332:8) {#if page!=1 && busqueda==false}",
    		ctx
    	});

    	return block;
    }

    // (333:8) <Button outline color="success" on:click="{getPreviousPage}">
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
    		source: "(333:8) <Button outline color=\\\"success\\\" on:click=\\\"{getPreviousPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (337:9) {#if (page+10) <= totalObj && busqueda==false}
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

    	button.$on("click", /*getNextPage*/ ctx[16]);

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
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(337:9) {#if (page+10) <= totalObj && busqueda==false}",
    		ctx
    	});

    	return block;
    }

    // (338:8) <Button outline color="success" on:click="{getNextPage}">
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
    		source: "(338:8) <Button outline color=\\\"success\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (259:20)           Loading poverty...      {:then poverty}
    function create_pending_block$2(ctx) {
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
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(259:20)           Loading poverty...      {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (345:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		source: "(345:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
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
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
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
    			add_location(br0, file$c, 342, 4, 11764);
    			add_location(br1, file$c, 343, 4, 11774);
    			add_location(br2, file$c, 345, 4, 11856);
    			add_location(br3, file$c, 346, 4, 11866);
    			add_location(main, file$c, 256, 0, 8378);
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

    			if (dirty & /*poverty*/ 512 && promise !== (promise = /*poverty*/ ctx[9]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
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
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const BASE_API_URL = "/api/v2";

    function instance$e($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let countryValue = "";
    	let yearValue = "";
    	let busqueda = false;

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
    		const res = await fetch(BASE_API_URL + "/poverty-stats?limit=10&offset=" + page); //obtener limit y offset
    		const res2 = await fetch(BASE_API_URL + "/poverty-stats"); //obtener datos
    		$$invalidate(4, busqueda = false);

    		if (res.ok && res2.ok) {
    			const json = await res.json();
    			const json2 = await res2.json();
    			$$invalidate(9, poverty = json); //pagina
    			$$invalidate(6, totalObj = json2.length); //datos
    			console.log("Received " + poverty.length + " data poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//GET LoadInitialData
    	async function getPovertyLoadInitialData() {
    		console.log("Fetching poverty...");

    		const msg = await fetch(BASE_API_URL + "/poverty-stats/loadInitialData").then(function (res) {
    			//mensaje de alerta
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(8, errorMSG = "Objetos cargados correctamente");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});

    		const elements = await fetch(BASE_API_URL + "/poverty-stats/loadInitialData"); //datos cargados
    		const jsonElements = await elements.json();
    		$$invalidate(7, page = 1);
    		$$invalidate(6, totalObj = jsonElements.length);
    		console.log("ELEMENTOS: " + totalObj);
    		const res = await fetch(BASE_API_URL + "/poverty-stats?limit=10&offset=1"); //datos mostrados

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(9, poverty = json);
    			console.log("Loading " + poverty.length + " objects");
    			console.log("Received " + poverty.length + " poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//INSERT
    	async function insertPoverty() {
    		console.log("Inserting poverty..." + JSON.stringify(newPoverty));

    		const res = await fetch(BASE_API_URL + "/poverty-stats", {
    			method: "POST",
    			body: JSON.stringify(newPoverty),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(6, totalObj++, totalObj);
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(8, errorMSG = newPoverty.country + " insertado correctamente");
    				console.log(newPoverty.country + " updated");
    				getPoverty();
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos o que no estén contenidos en la tabla.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	//SEARCH
    	async function searchPoverty(countryValue, yearValue) {
    		console.log("pais: " + countryValue + " año: " + yearValue);
    		var url = BASE_API_URL + "/poverty-stats?";

    		if (countryValue.length != 0) {
    			url = url + "&country=" + countryValue;
    		}

    		if (yearValue.length != 0) {
    			url = url + "&year=" + yearValue;
    		}

    		const elements = await fetch(url);
    		$$invalidate(0, visible = true);

    		if (elements.ok) {
    			$$invalidate(1, color = "success");
    			$$invalidate(8, errorMSG = "Se ha encontrado correctamente.");
    			const json = await elements.json();
    			$$invalidate(4, busqueda = true);
    			$$invalidate(9, poverty = []);
    			$$invalidate(9, poverty = json);
    			console.log(json);
    			console.log("Busqueda realizada: " + JSON.stringify(poverty[0], null, 2));
    		} else {
    			console.log("ERROR!: " + countryValue == " ");

    			if (elements.status == 404) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Elemento no encontrado.");
    				console.log("NOT FOUND");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUEST");
    			}
    		}
    	}

    	//DELETE
    	async function deletePoverty(country) {
    		const res = await fetch(BASE_API_URL + "/poverty-stats/" + country, { method: "DELETE" }).then(function (res) {
    			getPoverty();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(6, totalObj--, totalObj);
    				console.log("ELEMENTO: " + totalObj + " borrado.");
    				$$invalidate(1, color = "success");
    				$$invalidate(8, errorMSG = "Objeto borrado correctamente.");
    				console.log("Deleted " + country + " poverty.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Ha ocurrido un fallo.");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deletePovertyAll() {
    		const res = await fetch(BASE_API_URL + "/poverty-stats/", { method: "DELETE" }).then(function (res) {
    			getPoverty();
    			$$invalidate(0, visible = true);

    			if (res.status == 200) {
    				$$invalidate(7, page = 1);
    				$$invalidate(6, totalObj = 0);
    				console.log("ELEMENTOS: " + totalObj);
    				$$invalidate(1, color = "success");
    				$$invalidate(8, errorMSG = "Objetos borrados correctamente.");
    				console.log("Deleted all poverty.");
    			} else if (res.status == 400) {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = "Ha ocurrido un fallo.");
    				console.log("BAD REQUEST");
    			} else {
    				$$invalidate(1, color = "danger");
    				$$invalidate(8, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	// Next Page
    	async function getNextPage() {
    		$$invalidate(7, page += 10);

    		if (page > totalObj) {
    			$$invalidate(7, page -= 10);
    		}

    		await console.log(page);
    		console.log("Fetching poverty...");
    		const res = await fetch(BASE_API_URL + "/poverty-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(9, poverty = json);
    			console.log("Received " + poverty.length + " poverty.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	//Previus Page
    	async function getPreviousPage() {
    		if (page - 10 >= 0) {
    			$$invalidate(7, page -= 10);
    		}

    		await console.log(page);
    		console.log("Fetching poverty...");
    		const res = await fetch(BASE_API_URL + "/poverty-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(9, poverty = json);
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
    		countryValue = this.value;
    		$$invalidate(2, countryValue);
    	}

    	function input1_input_handler() {
    		yearValue = this.value;
    		$$invalidate(3, yearValue);
    	}

    	function input0_input_handler_1() {
    		newPoverty.country = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	function input1_input_handler_1() {
    		newPoverty.under_190 = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	function input2_input_handler() {
    		newPoverty.under_320 = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	function input3_input_handler() {
    		newPoverty.under_550 = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	function input4_input_handler() {
    		newPoverty.year = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	function input5_input_handler() {
    		newPoverty.continent = this.value;
    		$$invalidate(5, newPoverty);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		Alert,
    		visible,
    		color,
    		countryValue,
    		yearValue,
    		busqueda,
    		newPoverty,
    		poverty,
    		totalObj,
    		page,
    		errorMSG,
    		BASE_API_URL,
    		getPoverty,
    		getPovertyLoadInitialData,
    		insertPoverty,
    		searchPoverty,
    		deletePoverty,
    		deletePovertyAll,
    		getNextPage,
    		getPreviousPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("countryValue" in $$props) $$invalidate(2, countryValue = $$props.countryValue);
    		if ("yearValue" in $$props) $$invalidate(3, yearValue = $$props.yearValue);
    		if ("busqueda" in $$props) $$invalidate(4, busqueda = $$props.busqueda);
    		if ("newPoverty" in $$props) $$invalidate(5, newPoverty = $$props.newPoverty);
    		if ("poverty" in $$props) $$invalidate(9, poverty = $$props.poverty);
    		if ("totalObj" in $$props) $$invalidate(6, totalObj = $$props.totalObj);
    		if ("page" in $$props) $$invalidate(7, page = $$props.page);
    		if ("errorMSG" in $$props) $$invalidate(8, errorMSG = $$props.errorMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		color,
    		countryValue,
    		yearValue,
    		busqueda,
    		newPoverty,
    		totalObj,
    		page,
    		errorMSG,
    		poverty,
    		getPoverty,
    		getPovertyLoadInitialData,
    		insertPoverty,
    		searchPoverty,
    		deletePoverty,
    		deletePovertyAll,
    		getNextPage,
    		getPreviousPage,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	];
    }

    class Home$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\front\GUI2POVERTY\EditPoverty.svelte generated by Svelte v3.22.3 */

    const { console: console_1$6 } = globals;
    const file$d = "src\\front\\GUI2POVERTY\\EditPoverty.svelte";

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

    // (99:4) {:then poverty}
    function create_then_block$3(ctx) {
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

    			if (dirty & /*$$scope, errorMSG*/ 262400) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedContinent, updatedYear, updatedUnder550, updatedUnder320, updatedUnder190, updatedCountry*/ 262396) {
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
    		source: "(99:4) {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (102:8) {#if errorMSG}
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
    		source: "(102:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (101:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
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
    		source: "(101:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (126:25) <Button outline  color="primary" on:click={updatePoverty}>
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Modificar");
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
    		source: "(126:25) <Button outline  color=\\\"primary\\\" on:click={updatePoverty}>",
    		ctx
    	});

    	return block;
    }

    // (107:8) <Table responsive>
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
    	let td0;
    	let t12;
    	let t13;
    	let td1;
    	let input0;
    	let t14;
    	let td2;
    	let input1;
    	let t15;
    	let td3;
    	let input2;
    	let t16;
    	let td4;
    	let t17;
    	let t18;
    	let td5;
    	let input3;
    	let t19;
    	let td6;
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
    			td0 = element("td");
    			t12 = text(/*updatedCountry*/ ctx[2]);
    			t13 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t14 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t15 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t16 = space();
    			td4 = element("td");
    			t17 = text(/*updatedYear*/ ctx[6]);
    			t18 = space();
    			td5 = element("td");
    			input3 = element("input");
    			t19 = space();
    			td6 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$d, 109, 20, 3507);
    			add_location(th1, file$d, 110, 20, 3546);
    			add_location(th2, file$d, 111, 20, 3586);
    			add_location(th3, file$d, 112, 20, 3626);
    			add_location(th4, file$d, 113, 20, 3666);
    			add_location(th5, file$d, 114, 20, 3702);
    			add_location(tr0, file$d, 108, 16, 3481);
    			add_location(thead, file$d, 107, 12, 3456);
    			add_location(td0, file$d, 119, 20, 3830);
    			add_location(input0, file$d, 120, 24, 3881);
    			add_location(td1, file$d, 120, 20, 3877);
    			add_location(input1, file$d, 121, 24, 3950);
    			add_location(td2, file$d, 121, 20, 3946);
    			add_location(input2, file$d, 122, 24, 4019);
    			add_location(td3, file$d, 122, 20, 4015);
    			add_location(td4, file$d, 123, 20, 4084);
    			add_location(input3, file$d, 124, 24, 4132);
    			add_location(td5, file$d, 124, 20, 4128);
    			add_location(td6, file$d, 125, 20, 4198);
    			add_location(tr1, file$d, 118, 16, 3804);
    			add_location(tbody, file$d, 117, 12, 3779);
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
    			append_dev(td0, t12);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*updatedUnder190*/ ctx[3]);
    			append_dev(tr1, t14);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*updatedUnder320*/ ctx[4]);
    			append_dev(tr1, t15);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*updatedUnder550*/ ctx[5]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td4);
    			append_dev(td4, t17);
    			append_dev(tr1, t18);
    			append_dev(tr1, td5);
    			append_dev(td5, input3);
    			set_input_value(input3, /*updatedContinent*/ ctx[7]);
    			append_dev(tr1, t19);
    			append_dev(tr1, td6);
    			mount_component(button, td6, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[16]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[17])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updatedCountry*/ 4) set_data_dev(t12, /*updatedCountry*/ ctx[2]);

    			if (dirty & /*updatedUnder190*/ 8 && input0.value !== /*updatedUnder190*/ ctx[3]) {
    				set_input_value(input0, /*updatedUnder190*/ ctx[3]);
    			}

    			if (dirty & /*updatedUnder320*/ 16 && input1.value !== /*updatedUnder320*/ ctx[4]) {
    				set_input_value(input1, /*updatedUnder320*/ ctx[4]);
    			}

    			if (dirty & /*updatedUnder550*/ 32 && input2.value !== /*updatedUnder550*/ ctx[5]) {
    				set_input_value(input2, /*updatedUnder550*/ ctx[5]);
    			}

    			if (!current || dirty & /*updatedYear*/ 64) set_data_dev(t17, /*updatedYear*/ ctx[6]);

    			if (dirty & /*updatedContinent*/ 128 && input3.value !== /*updatedContinent*/ ctx[7]) {
    				set_input_value(input3, /*updatedContinent*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
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
    		source: "(107:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (97:20)           Loading poverty...      {:then poverty}
    function create_pending_block$3(ctx) {
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
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(97:20)           Loading poverty...      {:then poverty}",
    		ctx
    	});

    	return block;
    }

    // (131:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		source: "(131:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let main;
    	let promise;
    	let t;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*poverty*/ ctx[9], info);

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
    			info.block.c();
    			t = space();
    			create_component(button.$$.fragment);
    			add_location(main, file$d, 95, 0, 3163);
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

    			if (dirty & /*$$scope*/ 262144) {
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const BASE_API_URL$1 = "/api/v2";

    function instance$f($$self, $$props, $$invalidate) {
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
    		const res = await fetch(BASE_API_URL$1 + "/poverty-stats?country=" + params.country + "&year=" + params.year);

    		if (res.ok) {
    			console.log("Ok:");
    			console.log("data poverty of " + params.country + " found");
    			const json = await res.json();
    			$$invalidate(9, poverty = json[0]);
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

    		const res = await fetch(BASE_API_URL$1 + "/poverty-stats/" + updatedCountry + "/" + updatedYear, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: updatedCountry,
    				under_190: updatedUnder190,
    				under_320: updatedUnder320,
    				under_550: updatedUnder550,
    				year: updatedYear,
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
    		updatedUnder190 = this.value;
    		$$invalidate(3, updatedUnder190);
    	}

    	function input1_input_handler() {
    		updatedUnder320 = this.value;
    		$$invalidate(4, updatedUnder320);
    	}

    	function input2_input_handler() {
    		updatedUnder550 = this.value;
    		$$invalidate(5, updatedUnder550);
    	}

    	function input3_input_handler() {
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
    		BASE_API_URL: BASE_API_URL$1,
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
    		input3_input_handler
    	];
    }

    class EditPoverty extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { params: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditPoverty",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get params() {
    		throw new Error("<EditPoverty>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditPoverty>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\GUI2POVERTY\Highchart.svelte generated by Svelte v3.22.3 */

    const { console: console_1$7 } = globals;
    const file$e = "src\\front\\GUI2POVERTY\\Highchart.svelte";

    function create_fragment$g(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t;
    	let main;
    	let figure;
    	let div;
    	let dispose;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t = space();
    			main = element("main");
    			figure = element("figure");
    			div = element("div");
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$e, 175, 4, 4666);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/modules/series-label.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$e, 176, 4, 4737);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$e, 177, 4, 4818);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/export-data.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$e, 178, 4, 4896);
    			attr_dev(div, "id", "container");
    			add_location(div, file$e, 184, 8, 5074);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$e, 183, 4, 5030);
    			add_location(main, file$e, 181, 0, 5012);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			if (remount) dispose();
    			dispose = listen_dev(script3, "load", loadGraphs$2, false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function ordenarAsc(array, key) {
    	var arrayAux = [];

    	for (var i = 0; i < array.length - 1; i++) {
    		for (let j = i + 1; j < array.length; j++) {
    			if (array[i][key] > array[j][key]) {
    				arrayAux = array[i];
    				array[i] = array[j];
    				array[j] = arrayAux;
    			}
    		}
    	}

    	return array;
    }

    async function loadGraphs$2() {
    	let MyData = [];
    	const resData = await fetch("/api/v2/poverty-stats");
    	MyData = await resData.json();
    	ordenarAsc(MyData, "year");

    	var year = MyData.map(dato => {
    		return dato.year;
    	});

    	year = year.filter(function (valor, indiceActual, arreglo) {
    		let indiceAlBuscar = arreglo.indexOf(valor);

    		if (indiceActual === indiceAlBuscar) {
    			return true;
    		} else {
    			return false;
    		}
    	});

    	console.log(year);

    	var euro = MyData.filter(function (el) {
    		return el.continent == "europe";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	var asia = MyData.filter(function (el) {
    		return el.continent == "asia";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	var africa = MyData.filter(function (el) {
    		return el.continent == "africa";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	var south = MyData.filter(function (el) {
    		return el.continent == "south america";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	var north = MyData.filter(function (el) {
    		return el.continent == "north america";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	var oceania = MyData.filter(function (el) {
    		return el.continent == "oceania";
    	}).map(dato => {
    		return parseFloat(dato.under_320);
    	});

    	Highcharts.chart("container", {
    		chart: { type: "spline" },
    		title: { text: "Indice de pobreza inferior a 5.5" },
    		xAxis: { categories: year },
    		yAxis: {
    			title: { text: "Indice" },
    			labels: {
    				formatter() {
    					return this.value;
    				}
    			}
    		},
    		tooltip: { crosshairs: true, shared: true },
    		plotOptions: {
    			spline: {
    				marker: {
    					radius: 4,
    					lineColor: "#666666",
    					lineWidth: 1
    				}
    			}
    		},
    		series: [
    			{
    				name: "Asia",
    				marker: { symbol: "square" },
    				data: asia
    			},
    			{
    				name: "South America",
    				marker: { symbol: "square" },
    				data: south
    			},
    			{
    				name: "North America",
    				marker: { symbol: "square" },
    				data: north
    			},
    			{
    				name: "Oceania",
    				marker: { symbol: "square" },
    				data: oceania
    			},
    			{
    				name: "Africa",
    				marker: { symbol: "square" },
    				data: africa
    			},
    			{
    				name: "Europa",
    				marker: { symbol: "square" },
    				data: euro
    			}
    		]
    	});
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Highchart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Highchart", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Alert,
    		ordenarAsc,
    		loadGraphs: loadGraphs$2
    	});

    	return [];
    }

    class Highchart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Highchart",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\front\GUI3LQ\Home.svelte generated by Svelte v3.22.3 */

    const { console: console_1$8 } = globals;
    const file$f = "src\\front\\GUI3LQ\\Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import{          onMount      }
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
    		source: "(1:0) <script>      import{          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (354:4) {:then lq}
    function create_then_block$4(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;

    	const button0 = new Button({
    			props: {
    				color: "primary",
    				class: "mb-3",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[20]);

    	const collapse = new Collapse({
    			props: {
    				isOpen: /*isOpen*/ ctx[0],
    				$$slots: { default: [create_default_slot_9$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[2],
    				isOpen: /*visible*/ ctx[1],
    				toggle: /*func*/ ctx[23],
    				$$slots: { default: [create_default_slot_8$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				bordered: true,
    				responsive: true,
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button1 = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*getLQLoadInitialData*/ ctx[9]);

    	const button2 = new Button({
    			props: {
    				color: "danger",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*deleteLQALL*/ ctx[14]);

    	const button3 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*getPreviewPage*/ ctx[16]);

    	const button4 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button4.$on("click", /*getNextPage*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(collapse.$$.fragment);
    			t1 = space();
    			div = element("div");
    			create_component(alert.$$.fragment);
    			t2 = space();
    			create_component(table.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			create_component(button2.$$.fragment);
    			t5 = space();
    			create_component(button3.$$.fragment);
    			t6 = space();
    			create_component(button4.$$.fragment);
    			add_location(div, file$f, 381, 8, 11371);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(collapse, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(alert, div, null);
    			insert_dev(target, t2, anchor);
    			mount_component(table, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(button2, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(button3, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(button4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const collapse_changes = {};
    			if (dirty[0] & /*isOpen*/ 1) collapse_changes.isOpen = /*isOpen*/ ctx[0];

    			if (dirty[0] & /*busqueda, country, year*/ 224 | dirty[1] & /*$$scope*/ 256) {
    				collapse_changes.$$scope = { dirty, ctx };
    			}

    			collapse.$set(collapse_changes);
    			const alert_changes = {};
    			if (dirty[0] & /*color*/ 4) alert_changes.color = /*color*/ ctx[2];
    			if (dirty[0] & /*visible*/ 2) alert_changes.isOpen = /*visible*/ ctx[1];
    			if (dirty[0] & /*visible*/ 2) alert_changes.toggle = /*func*/ ctx[23];

    			if (dirty[0] & /*errorMSG*/ 16 | dirty[1] & /*$$scope*/ 256) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty[0] & /*lq, newLQ*/ 264 | dirty[1] & /*$$scope*/ 256) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    			const button4_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button4_changes.$$scope = { dirty, ctx };
    			}

    			button4.$set(button4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(collapse.$$.fragment, local);
    			transition_in(alert.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(button4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(collapse.$$.fragment, local);
    			transition_out(alert.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(button4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(collapse, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(alert);
    			if (detaching) detach_dev(t2);
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(button2, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(button3, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(button4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(354:4) {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (357:4) <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar lq");
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
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(357:4) <Button color=\\\"primary\\\" on:click={() => (isOpen = !isOpen)} class=\\\"mb-3\\\">",
    		ctx
    	});

    	return block;
    }

    // (368:20) <Button outline color="info" on:click="{searchLQ(country, year)}">
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
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
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(368:20) <Button outline color=\\\"info\\\" on:click=\\\"{searchLQ(country, year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (371:20) {#if busqueda==true}
    function create_if_block_1$3(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_11$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*resetLQ*/ ctx[11]);

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

    			if (dirty[1] & /*$$scope*/ 256) {
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(371:20) {#if busqueda==true}",
    		ctx
    	});

    	return block;
    }

    // (372:20) <Button outline color="info" on:click="{resetLQ}">
    function create_default_slot_11$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reiniciar filtro");
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
    		id: create_default_slot_11$2.name,
    		type: "slot",
    		source: "(372:20) <Button outline color=\\\"info\\\" on:click=\\\"{resetLQ}\\\">",
    		ctx
    	});

    	return block;
    }

    // (361:8) <Table responsive>
    function create_default_slot_10$2(ctx) {
    	let tbody;
    	let tr;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let t3;
    	let current;
    	let dispose;

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*searchLQ*/ ctx[10](/*country*/ ctx[6], /*year*/ ctx[7]))) /*searchLQ*/ ctx[10](/*country*/ ctx[6], /*year*/ ctx[7]).apply(this, arguments);
    	});

    	let if_block = /*busqueda*/ ctx[5] == true && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			tr = element("tr");
    			t0 = text("Country: ");
    			input0 = element("input");
    			t1 = text(" Year: ");
    			input1 = element("input");
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$f, 365, 29, 10802);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$f, 365, 78, 10851);
    			add_location(tr, file$f, 363, 16, 10745);
    			add_location(tbody, file$f, 362, 12, 10720);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, t0);
    			append_dev(tr, input0);
    			set_input_value(input0, /*country*/ ctx[6]);
    			append_dev(tr, t1);
    			append_dev(tr, input1);
    			set_input_value(input1, /*year*/ ctx[7]);
    			append_dev(tr, t2);
    			mount_component(button, tr, null);
    			append_dev(tr, t3);
    			if (if_block) if_block.m(tr, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[21]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[22])
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*country*/ 64 && input0.value !== /*country*/ ctx[6]) {
    				set_input_value(input0, /*country*/ ctx[6]);
    			}

    			if (dirty[0] & /*year*/ 128 && input1.value !== /*year*/ ctx[7]) {
    				set_input_value(input1, /*year*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*busqueda*/ ctx[5] == true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*busqueda*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(tr, null);
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
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$2.name,
    		type: "slot",
    		source: "(361:8) <Table responsive>",
    		ctx
    	});

    	return block;
    }

    // (360:4) <Collapse {isOpen}>
    function create_default_slot_9$2(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				responsive: true,
    				$$slots: { default: [create_default_slot_10$2] },
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

    			if (dirty[0] & /*busqueda, country, year*/ 224 | dirty[1] & /*$$scope*/ 256) {
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
    		id: create_default_slot_9$2.name,
    		type: "slot",
    		source: "(360:4) <Collapse {isOpen}>",
    		ctx
    	});

    	return block;
    }

    // (384:16) {#if errorMSG}
    function create_if_block$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*errorMSG*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMSG*/ 16) set_data_dev(t, /*errorMSG*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(384:16) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (383:12) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_8$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[4] && create_if_block$9(ctx);

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
    			if (/*errorMSG*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
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
    		id: create_default_slot_8$2.name,
    		type: "slot",
    		source: "(383:12) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (410:28) <Button outline color="primary" on:click={insertLQ}>
    function create_default_slot_7$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Insertar");
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
    		source: "(410:28) <Button outline color=\\\"primary\\\" on:click={insertLQ}>",
    		ctx
    	});

    	return block;
    }

    // (427:28) <Button outline color="danger" on:click="{deleteLQ(lifeq.country, lifeq.year)}">
    function create_default_slot_6$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
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
    		source: "(427:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteLQ(lifeq.country, lifeq.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (426:20) {#each lq as lifeq}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1_value = /*lifeq*/ ctx[36].rank + "";
    	let t1;
    	let t2;
    	let td2;
    	let a0;
    	let t3_value = /*lifeq*/ ctx[36].country + "";
    	let t3;
    	let a0_href_value;
    	let t4;
    	let td3;
    	let t5_value = /*lifeq*/ ctx[36].stability + "";
    	let t5;
    	let t6;
    	let td4;
    	let t7_value = /*lifeq*/ ctx[36].right + "";
    	let t7;
    	let t8;
    	let td5;
    	let t9_value = /*lifeq*/ ctx[36].health + "";
    	let t9;
    	let t10;
    	let td6;
    	let t11_value = /*lifeq*/ ctx[36].security + "";
    	let t11;
    	let t12;
    	let td7;
    	let t13_value = /*lifeq*/ ctx[36].climate + "";
    	let t13;
    	let t14;
    	let td8;
    	let t15_value = /*lifeq*/ ctx[36].costs + "";
    	let t15;
    	let t16;
    	let td9;
    	let t17_value = /*lifeq*/ ctx[36].popularity + "";
    	let t17;
    	let t18;
    	let td10;
    	let t19_value = /*lifeq*/ ctx[36].total + "";
    	let t19;
    	let t20;
    	let td11;
    	let a1;
    	let t21_value = /*lifeq*/ ctx[36].year + "";
    	let t21;
    	let a1_href_value;
    	let t22;
    	let td12;
    	let t23_value = /*lifeq*/ ctx[36].continent + "";
    	let t23;
    	let t24;
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
    		if (is_function(/*deleteLQ*/ ctx[13](/*lifeq*/ ctx[36].country, /*lifeq*/ ctx[36].year))) /*deleteLQ*/ ctx[13](/*lifeq*/ ctx[36].country, /*lifeq*/ ctx[36].year).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			create_component(button.$$.fragment);
    			t0 = space();
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			a0 = element("a");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			t5 = text(t5_value);
    			t6 = space();
    			td4 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			td5 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td6 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			td7 = element("td");
    			t13 = text(t13_value);
    			t14 = space();
    			td8 = element("td");
    			t15 = text(t15_value);
    			t16 = space();
    			td9 = element("td");
    			t17 = text(t17_value);
    			t18 = space();
    			td10 = element("td");
    			t19 = text(t19_value);
    			t20 = space();
    			td11 = element("td");
    			a1 = element("a");
    			t21 = text(t21_value);
    			t22 = space();
    			td12 = element("td");
    			t23 = text(t23_value);
    			t24 = space();
    			add_location(td0, file$f, 426, 24, 13434);
    			add_location(td1, file$f, 427, 24, 13564);
    			attr_dev(a0, "href", a0_href_value = "#/lq-stats/" + /*lifeq*/ ctx[36].country + "/" + /*lifeq*/ ctx[36].year);
    			add_location(a0, file$f, 428, 28, 13615);
    			add_location(td2, file$f, 428, 24, 13611);
    			add_location(td3, file$f, 429, 24, 13715);
    			add_location(td4, file$f, 430, 24, 13767);
    			add_location(td5, file$f, 431, 24, 13815);
    			add_location(td6, file$f, 432, 24, 13864);
    			add_location(td7, file$f, 433, 24, 13915);
    			add_location(td8, file$f, 434, 24, 13965);
    			add_location(td9, file$f, 435, 24, 14013);
    			add_location(td10, file$f, 436, 24, 14066);
    			attr_dev(a1, "href", a1_href_value = "#/lq-stats/" + /*lifeq*/ ctx[36].country + "/" + /*lifeq*/ ctx[36].year);
    			add_location(a1, file$f, 437, 28, 14118);
    			add_location(td11, file$f, 437, 24, 14114);
    			add_location(td12, file$f, 438, 24, 14215);
    			add_location(tr, file$f, 426, 20, 13430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			mount_component(button, td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, a0);
    			append_dev(a0, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			append_dev(td3, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(td4, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td5);
    			append_dev(td5, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td6);
    			append_dev(td6, t11);
    			append_dev(tr, t12);
    			append_dev(tr, td7);
    			append_dev(td7, t13);
    			append_dev(tr, t14);
    			append_dev(tr, td8);
    			append_dev(td8, t15);
    			append_dev(tr, t16);
    			append_dev(tr, td9);
    			append_dev(td9, t17);
    			append_dev(tr, t18);
    			append_dev(tr, td10);
    			append_dev(td10, t19);
    			append_dev(tr, t20);
    			append_dev(tr, td11);
    			append_dev(td11, a1);
    			append_dev(a1, t21);
    			append_dev(tr, t22);
    			append_dev(tr, td12);
    			append_dev(td12, t23);
    			append_dev(tr, t24);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			if ((!current || dirty[0] & /*lq*/ 256) && t1_value !== (t1_value = /*lifeq*/ ctx[36].rank + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t3_value !== (t3_value = /*lifeq*/ ctx[36].country + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty[0] & /*lq*/ 256 && a0_href_value !== (a0_href_value = "#/lq-stats/" + /*lifeq*/ ctx[36].country + "/" + /*lifeq*/ ctx[36].year)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty[0] & /*lq*/ 256) && t5_value !== (t5_value = /*lifeq*/ ctx[36].stability + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t7_value !== (t7_value = /*lifeq*/ ctx[36].right + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t9_value !== (t9_value = /*lifeq*/ ctx[36].health + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t11_value !== (t11_value = /*lifeq*/ ctx[36].security + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t13_value !== (t13_value = /*lifeq*/ ctx[36].climate + "")) set_data_dev(t13, t13_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t15_value !== (t15_value = /*lifeq*/ ctx[36].costs + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t17_value !== (t17_value = /*lifeq*/ ctx[36].popularity + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t19_value !== (t19_value = /*lifeq*/ ctx[36].total + "")) set_data_dev(t19, t19_value);
    			if ((!current || dirty[0] & /*lq*/ 256) && t21_value !== (t21_value = /*lifeq*/ ctx[36].year + "")) set_data_dev(t21, t21_value);

    			if (!current || dirty[0] & /*lq*/ 256 && a1_href_value !== (a1_href_value = "#/lq-stats/" + /*lifeq*/ ctx[36].country + "/" + /*lifeq*/ ctx[36].year)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((!current || dirty[0] & /*lq*/ 256) && t23_value !== (t23_value = /*lifeq*/ ctx[36].continent + "")) set_data_dev(t23, t23_value);
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
    		source: "(426:20) {#each lq as lifeq}",
    		ctx
    	});

    	return block;
    }

    // (390:8) <Table bordered responsive>
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
    	let th12;
    	let t25;
    	let tbody;
    	let tr1;
    	let td0;
    	let t26;
    	let td1;
    	let input0;
    	let t27;
    	let td2;
    	let input1;
    	let t28;
    	let td3;
    	let input2;
    	let t29;
    	let td4;
    	let input3;
    	let t30;
    	let td5;
    	let input4;
    	let t31;
    	let td6;
    	let input5;
    	let t32;
    	let td7;
    	let input6;
    	let t33;
    	let td8;
    	let input7;
    	let t34;
    	let td9;
    	let input8;
    	let t35;
    	let td10;
    	let input9;
    	let t36;
    	let td11;
    	let input10;
    	let t37;
    	let td12;
    	let input11;
    	let t38;
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

    	button.$on("click", /*insertLQ*/ ctx[12]);
    	let each_value = /*lq*/ ctx[8];
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
    			th0.textContent = "Action";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Rank";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Country";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Stability";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Right";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Health";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Security";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Climate";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "Costs";
    			t17 = space();
    			th9 = element("th");
    			th9.textContent = "Popularity";
    			t19 = space();
    			th10 = element("th");
    			th10.textContent = "Total";
    			t21 = space();
    			th11 = element("th");
    			th11.textContent = "Year";
    			t23 = space();
    			th12 = element("th");
    			th12.textContent = "Continent";
    			t25 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			create_component(button.$$.fragment);
    			t26 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t27 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t28 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t29 = space();
    			td4 = element("td");
    			input3 = element("input");
    			t30 = space();
    			td5 = element("td");
    			input4 = element("input");
    			t31 = space();
    			td6 = element("td");
    			input5 = element("input");
    			t32 = space();
    			td7 = element("td");
    			input6 = element("input");
    			t33 = space();
    			td8 = element("td");
    			input7 = element("input");
    			t34 = space();
    			td9 = element("td");
    			input8 = element("input");
    			t35 = space();
    			td10 = element("td");
    			input9 = element("input");
    			t36 = space();
    			td11 = element("td");
    			input10 = element("input");
    			t37 = space();
    			td12 = element("td");
    			input11 = element("input");
    			t38 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$f, 391, 24, 11676);
    			add_location(th1, file$f, 392, 24, 11717);
    			add_location(th2, file$f, 393, 24, 11756);
    			add_location(th3, file$f, 394, 24, 11798);
    			add_location(th4, file$f, 395, 24, 11842);
    			add_location(th5, file$f, 396, 24, 11882);
    			add_location(th6, file$f, 397, 24, 11923);
    			add_location(th7, file$f, 398, 24, 11966);
    			add_location(th8, file$f, 399, 24, 12008);
    			add_location(th9, file$f, 400, 24, 12048);
    			add_location(th10, file$f, 401, 24, 12093);
    			add_location(th11, file$f, 402, 24, 12133);
    			add_location(th12, file$f, 403, 24, 12172);
    			attr_dev(tr0, "class", "svelte-1p6b9xa");
    			add_location(tr0, file$f, 391, 20, 11672);
    			attr_dev(thead, "class", "svelte-1p6b9xa");
    			add_location(thead, file$f, 390, 16, 11643);
    			add_location(td0, file$f, 409, 24, 12355);
    			add_location(input0, file$f, 410, 28, 12463);
    			add_location(td1, file$f, 410, 24, 12459);
    			add_location(input1, file$f, 411, 28, 12531);
    			add_location(td2, file$f, 411, 24, 12527);
    			add_location(input2, file$f, 412, 28, 12602);
    			add_location(td3, file$f, 412, 24, 12598);
    			add_location(input3, file$f, 413, 28, 12675);
    			add_location(td4, file$f, 413, 24, 12671);
    			add_location(input4, file$f, 414, 28, 12744);
    			add_location(td5, file$f, 414, 24, 12740);
    			add_location(input5, file$f, 415, 28, 12814);
    			add_location(td6, file$f, 415, 24, 12810);
    			add_location(input6, file$f, 416, 28, 12886);
    			add_location(td7, file$f, 416, 24, 12882);
    			add_location(input7, file$f, 417, 28, 12957);
    			add_location(td8, file$f, 417, 24, 12953);
    			add_location(input8, file$f, 418, 28, 13026);
    			add_location(td9, file$f, 418, 24, 13022);
    			add_location(input9, file$f, 419, 28, 13100);
    			add_location(td10, file$f, 419, 24, 13096);
    			add_location(input10, file$f, 420, 28, 13169);
    			add_location(td11, file$f, 420, 24, 13165);
    			add_location(input11, file$f, 421, 28, 13237);
    			add_location(td12, file$f, 421, 24, 13233);
    			add_location(tr1, file$f, 409, 20, 12351);
    			add_location(tbody, file$f, 408, 16, 12322);
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
    			append_dev(tr0, t23);
    			append_dev(tr0, th12);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			mount_component(button, td0, null);
    			append_dev(tr1, t26);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*newLQ*/ ctx[3].rank);
    			append_dev(tr1, t27);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*newLQ*/ ctx[3].country);
    			append_dev(tr1, t28);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*newLQ*/ ctx[3].stability);
    			append_dev(tr1, t29);
    			append_dev(tr1, td4);
    			append_dev(td4, input3);
    			set_input_value(input3, /*newLQ*/ ctx[3].right);
    			append_dev(tr1, t30);
    			append_dev(tr1, td5);
    			append_dev(td5, input4);
    			set_input_value(input4, /*newLQ*/ ctx[3].health);
    			append_dev(tr1, t31);
    			append_dev(tr1, td6);
    			append_dev(td6, input5);
    			set_input_value(input5, /*newLQ*/ ctx[3].security);
    			append_dev(tr1, t32);
    			append_dev(tr1, td7);
    			append_dev(td7, input6);
    			set_input_value(input6, /*newLQ*/ ctx[3].climate);
    			append_dev(tr1, t33);
    			append_dev(tr1, td8);
    			append_dev(td8, input7);
    			set_input_value(input7, /*newLQ*/ ctx[3].costs);
    			append_dev(tr1, t34);
    			append_dev(tr1, td9);
    			append_dev(td9, input8);
    			set_input_value(input8, /*newLQ*/ ctx[3].popularity);
    			append_dev(tr1, t35);
    			append_dev(tr1, td10);
    			append_dev(td10, input9);
    			set_input_value(input9, /*newLQ*/ ctx[3].total);
    			append_dev(tr1, t36);
    			append_dev(tr1, td11);
    			append_dev(td11, input10);
    			set_input_value(input10, /*newLQ*/ ctx[3].year);
    			append_dev(tr1, t37);
    			append_dev(tr1, td12);
    			append_dev(td12, input11);
    			set_input_value(input11, /*newLQ*/ ctx[3].continent);
    			append_dev(tbody, t38);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[24]),
    				listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[25]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[26]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[27]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[28]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[29]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[30]),
    				listen_dev(input7, "input", /*input7_input_handler*/ ctx[31]),
    				listen_dev(input8, "input", /*input8_input_handler*/ ctx[32]),
    				listen_dev(input9, "input", /*input9_input_handler*/ ctx[33]),
    				listen_dev(input10, "input", /*input10_input_handler*/ ctx[34]),
    				listen_dev(input11, "input", /*input11_input_handler*/ ctx[35])
    			];
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty[0] & /*newLQ*/ 8 && input0.value !== /*newLQ*/ ctx[3].rank) {
    				set_input_value(input0, /*newLQ*/ ctx[3].rank);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input1.value !== /*newLQ*/ ctx[3].country) {
    				set_input_value(input1, /*newLQ*/ ctx[3].country);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input2.value !== /*newLQ*/ ctx[3].stability) {
    				set_input_value(input2, /*newLQ*/ ctx[3].stability);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input3.value !== /*newLQ*/ ctx[3].right) {
    				set_input_value(input3, /*newLQ*/ ctx[3].right);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input4.value !== /*newLQ*/ ctx[3].health) {
    				set_input_value(input4, /*newLQ*/ ctx[3].health);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input5.value !== /*newLQ*/ ctx[3].security) {
    				set_input_value(input5, /*newLQ*/ ctx[3].security);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input6.value !== /*newLQ*/ ctx[3].climate) {
    				set_input_value(input6, /*newLQ*/ ctx[3].climate);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input7.value !== /*newLQ*/ ctx[3].costs) {
    				set_input_value(input7, /*newLQ*/ ctx[3].costs);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input8.value !== /*newLQ*/ ctx[3].popularity) {
    				set_input_value(input8, /*newLQ*/ ctx[3].popularity);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input9.value !== /*newLQ*/ ctx[3].total) {
    				set_input_value(input9, /*newLQ*/ ctx[3].total);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input10.value !== /*newLQ*/ ctx[3].year) {
    				set_input_value(input10, /*newLQ*/ ctx[3].year);
    			}

    			if (dirty[0] & /*newLQ*/ 8 && input11.value !== /*newLQ*/ ctx[3].continent) {
    				set_input_value(input11, /*newLQ*/ ctx[3].continent);
    			}

    			if (dirty[0] & /*lq, deleteLQ*/ 8448) {
    				each_value = /*lq*/ ctx[8];
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
    			if (detaching) detach_dev(t25);
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
    		source: "(390:8) <Table bordered responsive>",
    		ctx
    	});

    	return block;
    }

    // (445:8) <Button color="primary" on:click="{getLQLoadInitialData}">
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
    		source: "(445:8) <Button color=\\\"primary\\\" on:click=\\\"{getLQLoadInitialData}\\\">",
    		ctx
    	});

    	return block;
    }

    // (448:8) <Button color="danger" on:click="{deleteLQALL}">
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
    		source: "(448:8) <Button color=\\\"danger\\\" on:click=\\\"{deleteLQALL}\\\">",
    		ctx
    	});

    	return block;
    }

    // (451:8) <Button outline color="success" on:click="{getPreviewPage}">
    function create_default_slot_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		source: "(451:8) <Button outline color=\\\"success\\\" on:click=\\\"{getPreviewPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (454:8) <Button outline color="success" on:click="{getNextPage}">
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
    		source: "(454:8) <Button outline color=\\\"success\\\" on:click=\\\"{getNextPage}\\\">",
    		ctx
    	});

    	return block;
    }

    // (352:15)           Loading lq...      {:then lq}
    function create_pending_block$4(ctx) {
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
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(352:15)           Loading lq...      {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (460:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(460:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t0;
    	let main;
    	let h1;
    	let t2;
    	let promise;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let t6;
    	let figure;
    	let div;
    	let t7;
    	let p;
    	let current;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 8,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*lq*/ ctx[8], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "LQ Manager";
    			t2 = space();
    			info.block.c();
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			create_component(button.$$.fragment);
    			t6 = space();
    			figure = element("figure");
    			div = element("div");
    			t7 = space();
    			p = element("p");
    			p.textContent = "En esta gráfica veremos la clasificación de los países dependiendo de su calidad de vida en 2016";
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$f, 343, 4, 10099);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$f, 344, 4, 10170);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/export-data.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$f, 345, 4, 10248);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$f, 346, 4, 10328);
    			add_location(h1, file$f, 350, 4, 10459);
    			add_location(br0, file$f, 457, 4, 14834);
    			add_location(br1, file$f, 458, 4, 14844);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-1p6b9xa");
    			add_location(div, file$f, 462, 8, 14972);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$f, 463, 8, 15008);
    			attr_dev(figure, "class", "highcharts-figure svelte-1p6b9xa");
    			add_location(figure, file$f, 461, 4, 14928);
    			add_location(main, file$f, 349, 0, 10447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t3;
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);
    			mount_component(button, main, null);
    			append_dev(main, t6);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			append_dev(figure, t7);
    			append_dev(figure, p);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(script3, "load", LoadGraphs, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*lq*/ 256 && promise !== (promise = /*lq*/ ctx[8]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[8] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
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
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function LoadGraphs() {
    	let MyData = [];
    	const resData = await fetch("/api/v2/lq-stats");
    	MyData = await resData.json();

    	//xAxis
    	var paises = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.country]);

    	//yAxis
    	var stab = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.stability]);

    	var righ = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.right]);

    	var heal = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.health]);

    	var secu = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.security]);

    	var clima = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.climate]);

    	var cost = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.costs]);

    	var popu = MyData.filter(function (objeto) {
    		return objeto.year == 2016;
    	}).map(dato => [dato.popularity]);

    	Highcharts.chart("container", {
    		chart: { type: "bar" },
    		title: {
    			text: "Calidad de vida por países del año 2016"
    		},
    		xAxis: { categories: paises },
    		yAxis: { min: 0, title: { text: "" } },
    		legend: { reversed: true },
    		plotOptions: { series: { stacking: "normal" } },
    		series: [
    			{ name: "Stability", data: stab },
    			{ name: "Right", data: righ },
    			{ name: "Health", data: heal },
    			{ name: "Security", data: secu },
    			{ name: "Climate", data: clima },
    			{ name: "Costs", data: cost },
    			{ name: "Popularity", data: popu }
    		]
    	});
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let isOpen = false;

    	//ALERTAS
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
    	let busqueda = false;
    	let country = "";
    	let year = "";
    	onMount(getLQ);

    	//GET
    	async function getLQ() {
    		console.log("Fetching lq...");
    		const res = await fetch("api/v2/lq-stats?limit=10&offset=1");

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(8, lq = json);
    			console.log("Received " + lq.length + "lq.");
    		} else {
    			$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//GET LoadInitialData
    	async function getLQLoadInitialData() {
    		console.log("Fetching lq...");
    		await fetch("/api/v2/lq-stats/loadInitialData");
    		const res = await fetch("/api/v2/lq-stats?limit=10&offset=" + 1);

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(8, lq = json);
    			totaldata = 12;
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//SEARCH
    	async function searchLQ(country, year) {
    		console.log("país: " + country + " año: " + year);
    		let url = "api/v2/lq-stats?";

    		if (country.length != 0) {
    			url += "&country=" + country;
    		}

    		if (year.length != 0) {
    			url += "&year= " + year;
    		}

    		const res = await fetch(url);
    		$$invalidate(1, visible = true);
    		$$invalidate(5, busqueda = true);

    		if (res.ok) {
    			$$invalidate(2, color = "success");
    			$$invalidate(4, errorMSG = "Se ha encontrado el objeto correctamente");
    			const json = await res.json();
    			$$invalidate(8, lq = json);
    			console.log(json);
    			console.log("Búsqueda realizada: " + JSON.stringify(lq[0], null, 2));
    		} else {
    			console.log("ERROR!");
    			$$invalidate(1, visible = true);

    			if (res.status == 404) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "Elemento no encontrado.");
    				console.log("NOT FOUND");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "Ha ocurrido un fallo de petición");
    				console.log("BAD REQUEST");
    			}
    		}
    	}

    	//Reiniciar filtro search
    	async function resetLQ() {
    		$$invalidate(6, country = "");
    		$$invalidate(7, year = "");
    	}

    	//INSERT
    	async function insertLQ() {
    		console.log("Inserting lq..." + JSON.stringify(newLQ));

    		const res = await fetch("/api/v2/lq-stats", {
    			method: "POST",
    			body: JSON.stringify(newLQ),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getLQ();
    			$$invalidate(1, visible = true);

    			if (res.status == 200) {
    				totaldata++;
    				$$invalidate(2, color = "success");
    				$$invalidate(4, errorMSG = newLQ.country + " creado correctamente");
    				console.log("Inserted" + newLQ.country + " lq.");
    			} else if (res.status == 400) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.");
    				console.log("BAD REQUEST");
    			} else if (res.status == 409) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = newLQ.country + " " + newLQ.year + "  ya existe, recuerde que 'Year' y 'Country' son exclusivos.");
    				console.log("This data already exits");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.");
    			}
    		});
    	}

    	//DELETE SPECIFIC
    	async function deleteLQ(country, year) {
    		const res = await fetch("/api/v2/lq-stats/" + country + "/" + year, { method: "DELETE" }).then(function (res) {
    			$$invalidate(1, visible = true);
    			getLQ();

    			if (res.status == 200) {
    				totaldata--;
    				$$invalidate(2, color = "success");
    				$$invalidate(4, errorMSG = country + " " + year + " borrado correctamente");
    				console.log("Deleted " + country);
    			} else if (res.status == 404) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "No se ha encontrado el objeto " + country);
    				console.log("LIFEQ NOT FOUND");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//DELETE ALL
    	async function deleteLQALL() {
    		const res = await fetch("/api/v2/lq-stats", { method: "DELETE" }).then(function (res) {
    			getLQ();
    			$$invalidate(1, visible = true);

    			if (res.status == 200) {
    				totaldata = 0;
    				$$invalidate(2, color = "sucess");
    				$$invalidate(4, errorMSG = "Objetos borrados correctamente");
    				console.log("Deleted all lq.");
    			} else if (res.status == 400) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = "Ha ocurrido un fallo");
    				console.log("BAD REQUST");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    				console.log("ERROR!");
    			}
    		});
    	}

    	//getNextPage
    	async function getNextPage() {
    		console.log(totaldata);
    		page += 10;

    		if (page > totaldata) {
    			page -= 10;
    		}

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v2/lq-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok");
    			const json = await res.json();
    			$$invalidate(8, lq = json);
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(4, errorMSG = res.status + ":" + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	//getPreviewPage
    	async function getPreviewPage() {
    		if (page - 10 >= 1) {
    			page -= 10;
    		} else page = 1;

    		console.log("Charging page " + page);
    		const res = await fetch("/api/v2/lq-stats?limit=10&offset=" + page);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(8, lq = json);
    			console.log("Received " + lq.length + " lq.");
    		} else {
    			$$invalidate(4, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const click_handler = () => $$invalidate(0, isOpen = !isOpen);

    	function input0_input_handler() {
    		country = this.value;
    		$$invalidate(6, country);
    	}

    	function input1_input_handler() {
    		year = this.value;
    		$$invalidate(7, year);
    	}

    	const func = () => $$invalidate(1, visible = false);

    	function input0_input_handler_1() {
    		newLQ.rank = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input1_input_handler_1() {
    		newLQ.country = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input2_input_handler() {
    		newLQ.stability = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input3_input_handler() {
    		newLQ.right = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input4_input_handler() {
    		newLQ.health = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input5_input_handler() {
    		newLQ.security = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input6_input_handler() {
    		newLQ.climate = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input7_input_handler() {
    		newLQ.costs = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input8_input_handler() {
    		newLQ.popularity = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input9_input_handler() {
    		newLQ.total = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input10_input_handler() {
    		newLQ.year = this.value;
    		$$invalidate(3, newLQ);
    	}

    	function input11_input_handler() {
    		newLQ.continent = this.value;
    		$$invalidate(3, newLQ);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Alert,
    		Table,
    		Button,
    		Collapse,
    		CardBody,
    		Card,
    		isOpen,
    		visible,
    		color,
    		page,
    		totaldata,
    		lq,
    		newLQ,
    		errorMSG,
    		busqueda,
    		country,
    		year,
    		getLQ,
    		getLQLoadInitialData,
    		searchLQ,
    		resetLQ,
    		insertLQ,
    		deleteLQ,
    		deleteLQALL,
    		getNextPage,
    		getPreviewPage,
    		LoadGraphs
    	});

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("page" in $$props) page = $$props.page;
    		if ("totaldata" in $$props) totaldata = $$props.totaldata;
    		if ("lq" in $$props) $$invalidate(8, lq = $$props.lq);
    		if ("newLQ" in $$props) $$invalidate(3, newLQ = $$props.newLQ);
    		if ("errorMSG" in $$props) $$invalidate(4, errorMSG = $$props.errorMSG);
    		if ("busqueda" in $$props) $$invalidate(5, busqueda = $$props.busqueda);
    		if ("country" in $$props) $$invalidate(6, country = $$props.country);
    		if ("year" in $$props) $$invalidate(7, year = $$props.year);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		visible,
    		color,
    		newLQ,
    		errorMSG,
    		busqueda,
    		country,
    		year,
    		lq,
    		getLQLoadInitialData,
    		searchLQ,
    		resetLQ,
    		insertLQ,
    		deleteLQ,
    		deleteLQALL,
    		getNextPage,
    		getPreviewPage,
    		page,
    		totaldata,
    		getLQ,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		func,
    		input0_input_handler_1,
    		input1_input_handler_1,
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\front\GUI3LQ\EditLq.svelte generated by Svelte v3.22.3 */

    const { console: console_1$9 } = globals;
    const file$g = "src\\front\\GUI3LQ\\EditLq.svelte";

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

    // (118:4) {:then lq}
    function create_then_block$5(ctx) {
    	let t;
    	let current;

    	const alert = new Alert({
    			props: {
    				color: /*color*/ ctx[2],
    				isOpen: /*visible*/ ctx[1],
    				toggle: /*func*/ ctx[19],
    				$$slots: { default: [create_default_slot_3$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table = new Table({
    			props: {
    				responsive: true,
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$8] },
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
    			if (dirty & /*visible*/ 2) alert_changes.toggle = /*func*/ ctx[19];

    			if (dirty & /*$$scope, errorMSG*/ 1073741832) {
    				alert_changes.$$scope = { dirty, ctx };
    			}

    			alert.$set(alert_changes);
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedContinent, updatedYear, updatedTotal, updatedPopularity, updatedCosts, updatedClimate, updatedSecurity, updatedHealth, updatedRight, updatedStability, updatedCountry, updatedRank*/ 1073807344) {
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
    		source: "(118:4) {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (120:8) {#if errorMSG}
    function create_if_block$a(ctx) {
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
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(120:8) {#if errorMSG}",
    		ctx
    	});

    	return block;
    }

    // (119:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
    function create_default_slot_3$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*errorMSG*/ ctx[3] && create_if_block$a(ctx);

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
    					if_block = create_if_block$a(ctx);
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
    		id: create_default_slot_3$6.name,
    		type: "slot",
    		source: "(119:4) <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (156:25) <Button outline  color="primary" on:click={updateLq}>
    function create_default_slot_2$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
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
    		source: "(156:25) <Button outline  color=\\\"primary\\\" on:click={updateLq}>",
    		ctx
    	});

    	return block;
    }

    // (124:8) <Table responsive bordered>
    function create_default_slot_1$8(ctx) {
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
    	let th12;
    	let t25;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t26;
    	let td1;
    	let t27;
    	let t28;
    	let td2;
    	let input1;
    	let t29;
    	let td3;
    	let input2;
    	let t30;
    	let td4;
    	let input3;
    	let t31;
    	let td5;
    	let input4;
    	let t32;
    	let td6;
    	let input5;
    	let t33;
    	let td7;
    	let input6;
    	let t34;
    	let td8;
    	let input7;
    	let t35;
    	let td9;
    	let input8;
    	let t36;
    	let td10;
    	let t37;
    	let t38;
    	let td11;
    	let input9;
    	let t39;
    	let td12;
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

    	button.$on("click", /*updateLq*/ ctx[17]);

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
    			th12 = element("th");
    			th12.textContent = "Acción";
    			t25 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t26 = space();
    			td1 = element("td");
    			t27 = text(/*updatedCountry*/ ctx[5]);
    			t28 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t29 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t30 = space();
    			td4 = element("td");
    			input3 = element("input");
    			t31 = space();
    			td5 = element("td");
    			input4 = element("input");
    			t32 = space();
    			td6 = element("td");
    			input5 = element("input");
    			t33 = space();
    			td7 = element("td");
    			input6 = element("input");
    			t34 = space();
    			td8 = element("td");
    			input7 = element("input");
    			t35 = space();
    			td9 = element("td");
    			input8 = element("input");
    			t36 = space();
    			td10 = element("td");
    			t37 = text(/*updatedYear*/ ctx[6]);
    			t38 = space();
    			td11 = element("td");
    			input9 = element("input");
    			t39 = space();
    			td12 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$g, 126, 20, 4084);
    			add_location(th1, file$g, 127, 20, 4119);
    			add_location(th2, file$g, 128, 20, 4157);
    			add_location(th3, file$g, 129, 20, 4197);
    			add_location(th4, file$g, 130, 20, 4233);
    			add_location(th5, file$g, 131, 20, 4270);
    			add_location(th6, file$g, 132, 20, 4309);
    			add_location(th7, file$g, 133, 20, 4347);
    			add_location(th8, file$g, 134, 20, 4383);
    			add_location(th9, file$g, 135, 20, 4424);
    			add_location(th10, file$g, 136, 20, 4460);
    			add_location(th11, file$g, 137, 20, 4495);
    			add_location(th12, file$g, 138, 20, 4535);
    			add_location(tr0, file$g, 125, 16, 4058);
    			add_location(thead, file$g, 124, 12, 4033);
    			add_location(input0, file$g, 143, 24, 4664);
    			add_location(td0, file$g, 143, 20, 4660);
    			add_location(td1, file$g, 144, 20, 4725);
    			add_location(input1, file$g, 145, 24, 4776);
    			add_location(td2, file$g, 145, 20, 4772);
    			add_location(input2, file$g, 146, 24, 4846);
    			add_location(td3, file$g, 146, 20, 4842);
    			add_location(input3, file$g, 147, 24, 4912);
    			add_location(td4, file$g, 147, 20, 4908);
    			add_location(input4, file$g, 148, 24, 4979);
    			add_location(td5, file$g, 148, 20, 4975);
    			add_location(input5, file$g, 149, 24, 5048);
    			add_location(td6, file$g, 149, 20, 5044);
    			add_location(input6, file$g, 150, 24, 5116);
    			add_location(td7, file$g, 150, 20, 5112);
    			add_location(input7, file$g, 151, 24, 5182);
    			add_location(td8, file$g, 151, 20, 5178);
    			add_location(input8, file$g, 152, 24, 5253);
    			add_location(td9, file$g, 152, 20, 5249);
    			add_location(td10, file$g, 153, 20, 5315);
    			add_location(input9, file$g, 154, 24, 5363);
    			add_location(td11, file$g, 154, 20, 5359);
    			add_location(td12, file$g, 155, 20, 5429);
    			add_location(tr1, file$g, 142, 16, 4634);
    			add_location(tbody, file$g, 141, 12, 4609);
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
    			append_dev(tr0, t23);
    			append_dev(tr0, th12);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*updatedRank*/ ctx[4]);
    			append_dev(tr1, t26);
    			append_dev(tr1, td1);
    			append_dev(td1, t27);
    			append_dev(tr1, t28);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*updatedStability*/ ctx[8]);
    			append_dev(tr1, t29);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*updatedRight*/ ctx[9]);
    			append_dev(tr1, t30);
    			append_dev(tr1, td4);
    			append_dev(td4, input3);
    			set_input_value(input3, /*updatedHealth*/ ctx[10]);
    			append_dev(tr1, t31);
    			append_dev(tr1, td5);
    			append_dev(td5, input4);
    			set_input_value(input4, /*updatedSecurity*/ ctx[11]);
    			append_dev(tr1, t32);
    			append_dev(tr1, td6);
    			append_dev(td6, input5);
    			set_input_value(input5, /*updatedClimate*/ ctx[12]);
    			append_dev(tr1, t33);
    			append_dev(tr1, td7);
    			append_dev(td7, input6);
    			set_input_value(input6, /*updatedCosts*/ ctx[13]);
    			append_dev(tr1, t34);
    			append_dev(tr1, td8);
    			append_dev(td8, input7);
    			set_input_value(input7, /*updatedPopularity*/ ctx[14]);
    			append_dev(tr1, t35);
    			append_dev(tr1, td9);
    			append_dev(td9, input8);
    			set_input_value(input8, /*updatedTotal*/ ctx[15]);
    			append_dev(tr1, t36);
    			append_dev(tr1, td10);
    			append_dev(td10, t37);
    			append_dev(tr1, t38);
    			append_dev(tr1, td11);
    			append_dev(td11, input9);
    			set_input_value(input9, /*updatedContinent*/ ctx[7]);
    			append_dev(tr1, t39);
    			append_dev(tr1, td12);
    			mount_component(button, td12, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[20]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[21]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[22]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[23]),
    				listen_dev(input4, "input", /*input4_input_handler*/ ctx[24]),
    				listen_dev(input5, "input", /*input5_input_handler*/ ctx[25]),
    				listen_dev(input6, "input", /*input6_input_handler*/ ctx[26]),
    				listen_dev(input7, "input", /*input7_input_handler*/ ctx[27]),
    				listen_dev(input8, "input", /*input8_input_handler*/ ctx[28]),
    				listen_dev(input9, "input", /*input9_input_handler*/ ctx[29])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*updatedRank*/ 16 && input0.value !== /*updatedRank*/ ctx[4]) {
    				set_input_value(input0, /*updatedRank*/ ctx[4]);
    			}

    			if (!current || dirty & /*updatedCountry*/ 32) set_data_dev(t27, /*updatedCountry*/ ctx[5]);

    			if (dirty & /*updatedStability*/ 256 && input1.value !== /*updatedStability*/ ctx[8]) {
    				set_input_value(input1, /*updatedStability*/ ctx[8]);
    			}

    			if (dirty & /*updatedRight*/ 512 && input2.value !== /*updatedRight*/ ctx[9]) {
    				set_input_value(input2, /*updatedRight*/ ctx[9]);
    			}

    			if (dirty & /*updatedHealth*/ 1024 && input3.value !== /*updatedHealth*/ ctx[10]) {
    				set_input_value(input3, /*updatedHealth*/ ctx[10]);
    			}

    			if (dirty & /*updatedSecurity*/ 2048 && input4.value !== /*updatedSecurity*/ ctx[11]) {
    				set_input_value(input4, /*updatedSecurity*/ ctx[11]);
    			}

    			if (dirty & /*updatedClimate*/ 4096 && input5.value !== /*updatedClimate*/ ctx[12]) {
    				set_input_value(input5, /*updatedClimate*/ ctx[12]);
    			}

    			if (dirty & /*updatedCosts*/ 8192 && input6.value !== /*updatedCosts*/ ctx[13]) {
    				set_input_value(input6, /*updatedCosts*/ ctx[13]);
    			}

    			if (dirty & /*updatedPopularity*/ 16384 && input7.value !== /*updatedPopularity*/ ctx[14]) {
    				set_input_value(input7, /*updatedPopularity*/ ctx[14]);
    			}

    			if (dirty & /*updatedTotal*/ 32768 && input8.value !== /*updatedTotal*/ ctx[15]) {
    				set_input_value(input8, /*updatedTotal*/ ctx[15]);
    			}

    			if (!current || dirty & /*updatedYear*/ 64) set_data_dev(t37, /*updatedYear*/ ctx[6]);

    			if (dirty & /*updatedContinent*/ 128 && input9.value !== /*updatedContinent*/ ctx[7]) {
    				set_input_value(input9, /*updatedContinent*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
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
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$8.name,
    		type: "slot",
    		source: "(124:8) <Table responsive bordered>",
    		ctx
    	});

    	return block;
    }

    // (116:15)           Loading lq...      {:then lq}
    function create_pending_block$5(ctx) {
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
    		id: create_pending_block$5.name,
    		type: "pending",
    		source: "(116:15)           Loading lq...      {:then lq}",
    		ctx
    	});

    	return block;
    }

    // (161:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
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
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(161:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h3;
    	let t2;
    	let strong;
    	let t3_value = /*params*/ ctx[0].lqCountry + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$5,
    		then: create_then_block$5,
    		catch: create_catch_block$5,
    		value: 16,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*lq*/ ctx[16], info);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$9] },
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
    			h3 = element("h3");
    			t2 = text("Edit LQ ");
    			strong = element("strong");
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			create_component(button.$$.fragment);
    			add_location(h1, file$g, 113, 4, 3695);
    			add_location(strong, file$g, 114, 16, 3732);
    			add_location(h3, file$g, 114, 4, 3720);
    			add_location(main, file$g, 112, 0, 3683);
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
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].lqCountry + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*lq*/ 65536 && promise !== (promise = /*lq*/ ctx[16]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let visible = false;
    	let color = "danger";
    	let errorMSG = "";
    	let { params = {} } = $$props;
    	let lq = {};
    	let updatedRank = "";
    	let updatedCountry = "";
    	let updatedYear = "";
    	let updatedContinent = "";
    	let updatedStability = "";
    	let updatedRight = "";
    	let updatedHealth = "";
    	let updatedSecurity = "";
    	let updatedClimate = "";
    	let updatedCosts = "";
    	let updatedPopularity = "";
    	let updatedTotal = "";
    	onMount(getLQ1);

    	//GET
    	async function getLQ1() {
    		console.log("Fetching lq...");
    		const res = await fetch("/api/v2/lq-stats/" + params.lqCountry + "/" + params.lqYear);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(16, lq = json);
    			$$invalidate(5, updatedCountry = lq.country);
    			$$invalidate(4, updatedRank = lq.rank);
    			$$invalidate(6, updatedYear = params.lqYear);
    			$$invalidate(8, updatedStability = lq.stability);
    			$$invalidate(9, updatedRight = lq.right);
    			$$invalidate(10, updatedHealth = lq.health);
    			$$invalidate(11, updatedSecurity = lq.security);
    			$$invalidate(12, updatedClimate = lq.climate);
    			$$invalidate(13, updatedCosts = lq.costs);
    			$$invalidate(14, updatedPopularity = lq.popularity);
    			$$invalidate(15, updatedTotal = lq.total);
    			$$invalidate(7, updatedContinent = lq.continent);
    			console.log("Received " + lq.country);
    		} else {
    			$$invalidate(2, color = "danger");
    			$$invalidate(3, errorMSG = res.status + ": " + res.statusText);
    			console.log("ERROR!");
    		}
    	}

    	async function updateLq() {
    		console.log("Updating lq..." + JSON.stringify(params.lqCountry));

    		const res = await fetch("/api/v2/lq-stats/" + params.lqCountry + "/" + params.lqYear, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: updatedCountry,
    				rank: updatedRank,
    				right: updatedRight,
    				stability: updatedStability,
    				health: updatedHealth,
    				security: updatedSecurity,
    				climate: updatedClimate,
    				costs: updatedCosts,
    				popularity: updatedPopularity,
    				total: updatedTotal,
    				continent: updatedContinent,
    				year: params.lqYear
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			$$invalidate(1, visible = true);
    			getLQ1();

    			if (res.status == 200) {
    				$$invalidate(2, color = "success");
    				$$invalidate(3, errorMSG = updatedCountry + " actualizado correctamente");
    				console.log(updatedCountry + " updated");
    			} else if (res.status == 201) {
    				$$invalidate(3, errorMSG = updatedCountry + " actualizado correctamente");
    				$$invalidate(2, color = "success");
    				console.log(updatedCountry + " updated");
    			} else if (res.status == 404) {
    				$$invalidate(2, color = "danger");
    				$$invalidate(3, errorMSG = updatedCountry + " no ha sido encontrado");
    				console.log("LIFEQUALITY NOT FOUND");
    			} else {
    				$$invalidate(2, color = "danger");
    				$$invalidate(3, errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.");
    				console.log("BAD REQUEST");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$9.warn(`<EditLq> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditLq", $$slots, []);
    	const func = () => $$invalidate(1, visible = false);

    	function input0_input_handler() {
    		updatedRank = this.value;
    		$$invalidate(4, updatedRank);
    	}

    	function input1_input_handler() {
    		updatedStability = this.value;
    		$$invalidate(8, updatedStability);
    	}

    	function input2_input_handler() {
    		updatedRight = this.value;
    		$$invalidate(9, updatedRight);
    	}

    	function input3_input_handler() {
    		updatedHealth = this.value;
    		$$invalidate(10, updatedHealth);
    	}

    	function input4_input_handler() {
    		updatedSecurity = this.value;
    		$$invalidate(11, updatedSecurity);
    	}

    	function input5_input_handler() {
    		updatedClimate = this.value;
    		$$invalidate(12, updatedClimate);
    	}

    	function input6_input_handler() {
    		updatedCosts = this.value;
    		$$invalidate(13, updatedCosts);
    	}

    	function input7_input_handler() {
    		updatedPopularity = this.value;
    		$$invalidate(14, updatedPopularity);
    	}

    	function input8_input_handler() {
    		updatedTotal = this.value;
    		$$invalidate(15, updatedTotal);
    	}

    	function input9_input_handler() {
    		updatedContinent = this.value;
    		$$invalidate(7, updatedContinent);
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
    		errorMSG,
    		params,
    		lq,
    		updatedRank,
    		updatedCountry,
    		updatedYear,
    		updatedContinent,
    		updatedStability,
    		updatedRight,
    		updatedHealth,
    		updatedSecurity,
    		updatedClimate,
    		updatedCosts,
    		updatedPopularity,
    		updatedTotal,
    		getLQ1,
    		updateLq
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("errorMSG" in $$props) $$invalidate(3, errorMSG = $$props.errorMSG);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("lq" in $$props) $$invalidate(16, lq = $$props.lq);
    		if ("updatedRank" in $$props) $$invalidate(4, updatedRank = $$props.updatedRank);
    		if ("updatedCountry" in $$props) $$invalidate(5, updatedCountry = $$props.updatedCountry);
    		if ("updatedYear" in $$props) $$invalidate(6, updatedYear = $$props.updatedYear);
    		if ("updatedContinent" in $$props) $$invalidate(7, updatedContinent = $$props.updatedContinent);
    		if ("updatedStability" in $$props) $$invalidate(8, updatedStability = $$props.updatedStability);
    		if ("updatedRight" in $$props) $$invalidate(9, updatedRight = $$props.updatedRight);
    		if ("updatedHealth" in $$props) $$invalidate(10, updatedHealth = $$props.updatedHealth);
    		if ("updatedSecurity" in $$props) $$invalidate(11, updatedSecurity = $$props.updatedSecurity);
    		if ("updatedClimate" in $$props) $$invalidate(12, updatedClimate = $$props.updatedClimate);
    		if ("updatedCosts" in $$props) $$invalidate(13, updatedCosts = $$props.updatedCosts);
    		if ("updatedPopularity" in $$props) $$invalidate(14, updatedPopularity = $$props.updatedPopularity);
    		if ("updatedTotal" in $$props) $$invalidate(15, updatedTotal = $$props.updatedTotal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		visible,
    		color,
    		errorMSG,
    		updatedRank,
    		updatedCountry,
    		updatedYear,
    		updatedContinent,
    		updatedStability,
    		updatedRight,
    		updatedHealth,
    		updatedSecurity,
    		updatedClimate,
    		updatedCosts,
    		updatedPopularity,
    		updatedTotal,
    		lq,
    		updateLq,
    		getLQ1,
    		func,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler
    	];
    }

    class EditLq extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditLq",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get params() {
    		throw new Error("<EditLq>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditLq>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\App.svelte generated by Svelte v3.22.3 */
    const file$h = "src\\front\\App.svelte";

    function create_fragment$j(ctx) {
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
    			add_location(main, file$h, 35, 0, 1093);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const routes = {
    		"/": Home,
    		"/public/index.html": Home,
    		"/gui1spc": Home$1,
    		"/gui1SPCHighChart": HighChart,
    		"/gui1SPCApexChart": ApexChart,
    		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
    		"/gui2poverty": Home$2,
    		"/poverty-stats/:country/:year": EditPoverty,
    		"/gui2povertyHighChart": Highchart,
    		"/gui3lq": Home$3,
    		"/lq-stats/:lqCountry/:lqYear": EditLq,
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
    		NotFound,
    		Home,
    		GUI1SPC: Home$1,
    		GUI1SPCHighChart: HighChart,
    		GUI1SPCApexChart: ApexChart,
    		EditSpc,
    		GUI2POVERTY: Home$2,
    		EditPoverty,
    		GUI2POVERTYChart: Highchart,
    		GUI3LQ: Home$3,
    		EditLq,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector('#SvelteApp')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
