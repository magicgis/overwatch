<template>
<device :show="settings.freebox.display" v-if="connection">
    <div slot="body">
        <span>Freebox: {{ connection.state.toUpperCase() }}</span>
        <!--  <span>Down: {{ convert(connection.bandwidth_down) }}</span>-->
        <!--  <span>UP: {{ convert(connection.bandwidth_up) }}</span>-->
        <span>&#8595; {{ convert(connection.rate_down) }}</span>
        <span>&#8593; {{ convert(connection.rate_up) }}</span>
    </div>
    </device>
</template>

<script>
    import Device from './DeviceComponent.vue'
    export default {
        components: { Device },
        props: {
            settings: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                socket: this.$store.state.socket.socket,
                auth: {},
                login: {},
                session: {},
                connection: null,
            }
        },
        created() {
            this.init()
            setInterval(() => { this.getData() }, 5000)
        },
        methods: {
            init() {
                this.socket.emit('freebox.getAutorize')
                this.socket.on('freebox.getAutorize.result', (data) => {
                    if(data.success) {
                        this.auth.challenge = data.result.challenge
                        this.auth.salt = data.result.password_salt
                        this.auth.status = data.result.status
                        if(this.auth.status === 'granted') {
                            this.socket.emit('freebox.login')
                        }
                    }
                })
                this.socket.on('freebox.login.result', (data) => {
                    if(data.success) {
                        this.login.challenge = data.result.challenge
                        this.login.salt = data.result.password_salt
                        this.login.loggedIn = data.result.logged_in
                        this.socket.emit('freebox.openSession', {
                            challenge: this.login.challenge
                        })
                    }
                })
                this.socket.on('freebox.openSession.result', (data) => {
                    if(data.success) {
                        this.session.challenge = data.result.challenge
                        this.session.salt = data.result.password_salt
                        this.session.token = data.result.session_token
                        this.session.permissions = data.result.permissions
                        this.getData()
                    }
                })
            },
            getData() {
                this.socket.emit('freebox.connection', {
                    token: this.session.token
                })
                this.socket.on('freebox.connection.result', (data) => {
                    if(data.success) {
                        this.connection = data.result
                    }
                })
            },
            convert(value) {
                let o = value / 8
                if(o > 999) {
                    let ko = o / 1000
                    if(ko > 999) {
                        let mo = ko / 1000
                        return parseFloat(mo).toFixed(2) + ' Mo/s'
                    } else {
                        return parseFloat(ko).toFixed(2) + ' Ko/s'
                    }
                } else {
                    return parseFloat(o).toFixed(2) + ' o/s'
                }
            },
        },
    }
</script>

<style lang="sass" scoped>
@import '../sass/components/freebox'
</style>