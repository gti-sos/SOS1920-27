<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
 
</script> 
 <main>

  <!-- ======= Hero Section ======= -->
  <section id="hero" class="clearfix" style="min-width: 100%;">
    <div class="container d-flex h-100">
      <div class="row justify-content-center align-self-center">
        <div class="col-md-6 intro-info order-md-first order-last">
		  <h2>SOS1920-<span>27</span></h2>
		  <h3>Investigando sobre la relación entre la pobreza, 
			  la calidad de vida y los suicidios que posee cada país.</h3><br>
          <div>
            <a href="https://github.com/gti-sos/SOS1920-27" class="btn-get-started scrollto">Repositorio github</a>
          </div>
        </div>

        <div class="col-md-6 intro-img order-md-last order-first">
          <img src="assets/img/tree.png" alt="" class="img-fluid">
        </div>
      </div>

    </div>
  </section><!-- End Hero -->

    <!-- ======= Team Section ======= -->
    <section id="team" class="team section-bg">
		<div class="container">
		  <div class="section-header">
			<h3>Equipo</h3><br>
		  </div>
  
		  <div class="row">
  
			<div class="col-lg-3 col-md-6 wow fadeInUp" style="margin-left: 12%;">
			  <div class="member">
				<img src="assets/img/team-1.jpg" class="img-fluid" alt="">
				<div class="member-info">
				  <div class="member-info-content">
					<h4>Belén Domínguez</h4>
					<span>Suicidios</span>
					<div class="social">
					  <a href="https://github.com/sensatte"><i class="fa fa-github"></i></a>
					</div>
				  </div>
				</div>
			  </div>
			</div>
  
			<div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
			  <div class="member">
				<img src="assets/img/team-2.jpg" class="img-fluid" alt="">
				<div class="member-info">
				  <div class="member-info-content">
					<h4>José Manuel Pérez</h4>
					<span>Pobreza</span>
					<div class="social">
						<a href="https://github.com/JMPere"><i class="fa fa-github"></i></a>
					</div>
				  </div>
				</div>
			  </div>
			</div>
  
			<div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.2s">
			  <div class="member">
				<img src="assets/img/team-3.jpg" class="img-fluid" alt="">
				<div class="member-info">
				  <div class="member-info-content">
					<h4>Juan Luis Aguilera</h4>
					<span>Calidad de Vida</span>
					<div class="social">
						<a href="https://github.com/juanluidos"><i class="fa fa-github"></i></a>
					</div>
				  </div>
				</div>
			  </div>
			</div>
  		  </div>
  
		</div>
	  </section><!-- End Team Section -->
  
  
    <!-- ======= Services Section ======= -->
    <section id="services" class="services section-bg">
		<div class="container">
  
		  <header class="section-header">
			<h3>Documentación Postman</h3><br>
		  </header>
  
		  <div class="row">
			
			<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
			  <div class="box">
				<div class="icon" style="background: #fceef3;"><i class="ion-ios-analytics-outline" style="color: #ff689b;"></i></div>
				<h4 class="title"><a href="https://documenter.getpostman.com/view/10794870/SzmcbJvH">Suicidios v1</a></h4>
			  </div>
			</div>
			<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
			  <div class="box">
				<div class="icon" style="background: #fff0da;"><i class="ion-ios-bookmarks-outline" style="color: #e98e06;"></i></div>
				<h4 class="title"><a href="https://documenter.getpostman.com/view/10838721/SzYT5MmE?version=latest#569d199a-a751-485e-b15f-e77f5152e448">Pobreza v1</a></h4>
			  </div>
			</div>
  
			<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
			  <div class="box">
				<div class="icon" style="background: #e6fdfc;"><i class="ion-ios-paper-outline" style="color: #3fcdc7;"></i></div>
				<h4 class="title"><a href="https://documenter.getpostman.com/view/10696673/SzYT5hPv">Calidad de vida v1</a></h4>
			  </div>
			</div>

			<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
				<div class="box">
				  <div class="icon" style="background: #fceef3;"><i class="ion-ios-analytics-outline" style="color: #ff689b;"></i></div>
				  <h4 class="title"><a href="https://documenter.getpostman.com/view/10794870/SztBbo6C">Suicidios v3</a></h4>
				</div>
			  </div>
			  <div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
				<div class="box">
				  <div class="icon" style="background: #fff0da;"><i class="ion-ios-bookmarks-outline" style="color: #e98e06;"></i></div>
				  <h4 class="title"><a href="https://documenter.getpostman.com/view/10838721/Szme3xW4?version=latest">Pobreza v2</a></h4>
				</div>
			  </div>
	
			  <div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
				<div class="box">
				  <div class="icon" style="background: #e6fdfc;"><i class="ion-ios-paper-outline" style="color: #3fcdc7;"></i></div>
				  <h4 class="title"><a href="https://documenter.getpostman.com/view/10696673/Szme4dK5">Calidad de vida v2</a></h4>
				</div>
			  </div>

  
		  </div>
  
		</div>
	  </section><!-- End Services Section -->
  

    <!-- ======= About Section ======= -->
    <section id="about" class="about">

		<div class="container">
		  <div class="row">
  
			<div class="col-lg-5 col-md-6">
			  <div class="about-img">
				<img src="assets/img/about-img.jpg" alt="">
			  </div>
			</div>
  
			<div class="col-lg-7 col-md-6">
			  <div class="about-content">
				<h2>APIs y Fuentes</h2>
				<h3>APIs de los integrantes</h3>
				<ul>
					<li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/"> https://sos1920-27.herokuapp.com</a> </li>

				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v1/spc-stats"> https://sos1920-27.herokuapp.com/api/v1/spc-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v2/spc-stats"> https://sos1920-27.herokuapp.com/api/v2/spc-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v3/spc-stats"> https://sos1920-27.herokuapp.com/api/v3/spc-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v1/poverty-stats"> https://sos1920-27.herokuapp.com/api/v1/poverty-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v2/poverty-stats"> https://sos1920-27.herokuapp.com/api/v2/poverty-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v1/lq-stats"> https://sos1920-27.herokuapp.com/api/v1/lq-stats</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://sos1920-27.herokuapp.com/api/v2/lq-stats"> https://sos1920-27.herokuapp.com/api/v2/lq-stats</a> </li>
				</ul>
				<h3>Fuentes</h3>
				<ul>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://en.wikipedia.org/wiki/List_of_countries_by_suicide_rate"> Fuente Suicidios</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://en.wikipedia.org/wiki/List_of_countries_by_percentage_of_population_living_in_poverty" >Fuente Pobreza</a> </li>
				  <li><i class="ion-android-checkmark-circle"></i><a href="https://www.datosmundial.com/calidad-de-vida.php"> Fuente Calidad de vida</a> </li>
				</ul>

			  </div>
			</div>
		  </div>
		</div>
  
	  </section><!-- End About Section -->

	      <!-- ======= Services Section ======= -->
		  <section id="services" class="services section-bg">
			<div class="container">
	  
			  <header class="section-header">
				<h3>Vídeos de los componentes</h3><br>
			  </header>
	  
			  <div class="row">
				
				<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
				  <div class="box">
					<div class="icon" style="background: #fceef3;"><i class="ion-ios-analytics-outline" style="color: #ff689b;"></i></div>
					<h4 class="title"><a href="https://www.youtube.com/watch?v=fKRmUp_O7Ts">Suicidios Vídeo</a></h4>
				  </div>
				</div>
				<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-duration="1.4s">
				  <div class="box">
					<div class="icon" style="background: #fff0da;"><i class="ion-ios-bookmarks-outline" style="color: #e98e06;"></i></div>
					<h4 class="title"><a href="https://www.youtube.com/watch?v=fKRmUp_O7Ts">Pobreza Vídeo</a></h4>
				  </div>
				</div>
	  
				<div class="col-md-6 col-lg-4 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
				  <div class="box">
					<div class="icon" style="background: #e6fdfc;"><i class="ion-ios-paper-outline" style="color: #3fcdc7;"></i></div>
					<h4 class="title"><a href="https://youtu.be/8lSpumO_b64">Calidad de vida Vídeo</a></h4>
				  </div>
				</div>
	  
			  </div>
	  
			</div>
		  </section><!-- End Services Section -->

</main>