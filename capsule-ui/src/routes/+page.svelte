<script>
	import Footer from '#lib/layout/footer/Footer.svelte';
	import Header from '#lib/layout/header/Header.svelte';
	import Main from '#lib/layout/main/Main.svelte';
</script>

<div class="capsule">
	<Header />

	<Main />

	<Footer />
</div>

<style lang="scss">
	.capsule {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
