<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Experience from '$lib/components/cv/Experience.svelte';
	import Education from '$lib/components/cv/Education.svelte';
	import Skill from '$lib/components/cv/Skill.svelte';
</script>

<Container>
	<h1>Work experience</h1>
	<Experience
		data={{
			date_start: 'January 2023',
			date_end: '',
			position: 'Software Developer',
			employer: 'Grazper Technologies',
			image: '/cv/grazper_circle.svg'
		}}
	>
		<p>
			Developed an augmented reality system using real-time 3d pose estimation to display holograms
			on a screen from the correct 3d perspective of a person standing next to it. This is a full
			stack project, with frontends for calibration procedures and displaying holograms, and
			backends for interfacing with hardware and numerical algorithms.
		</p>

		<p>
			Developed a 'service broker' system for monitoring and launching all our services, and to
			allow services to find each other. This system makes it much easier to start up and develop
			product demos, as well as providing a convenient place to monitor running servces. The backend
			uses a combination of our own network stack, together with FastAPI, and the frontend is
			developed in Svelte with Tailwind CSS.
		</p>

		<p>
			Maintained and upgraded the Jenkins CI/CD pipeline, improving the workflow for all our Python
			projects.
		</p>
	</Experience>
	<Experience
		data={{
			date_start: 'March 2018',
			date_end: 'December 2022',
			position: 'Doctoral Candidate',
			employer: 'University of Geneva',
			image: '/cv/fac_sciences_pant.svg'
		}}
	>
		<p>
			Performed research in applied mathematics after first studying pure mathematics for 2 years.
			Focussed on advanced numerical optimization algorithms, particularly for tensors and their
			applications to machine learning. Developed 3 high-quality numerical software libraries in
			Python and contributed to 2 open-source projects as part of several research projects
			resulting in 4 manuscripts.
		</p>

		<p>
			Taught 3 courses per year as an assistant, receiving consistently positive feedback from
			students for clear solutions and lectures. Designed Python programming homework using Jupyter
			and unit tests for 5 courses well-received by both students and teaching staff.
		</p>
	</Experience>

	<h1>Education</h1>

	<Education
		data={{
			date_start: '2018/03',
			date_end: '2022/12',
			entry: [{ title: 'PhD in Mathematics', university: 'University of Geneva' }]
		}}
	/>
	<Education
		data={{
			date_start: '2015',
			date_end: '2018',
			entry: [
				{ title: 'Msc. Mathematical Sciences', university: 'Utrecht University', note: 'cum laude' }
			]
		}}
	/>
	<Education
		data={{
			date_start: '2012',
			date_end: '2015',
			entry: [
				{ title: 'Bsc. Mathematics', university: 'Utrecht University', note: 'cum laude' },
				{ title: 'Bsc. Physics and Astronomy', university: 'Utrecht University', note: 'cum laude' }
			]
		}}
	/>

	<h1>Programming skills</h1>
	<Skill data={{ title: 'Advanced', skills: ['Python'], icons: ['python'] }} />
	<Skill data={{ title: 'Intermediate', skills: ['LaTeX', 'Mathematica', 'C/C++'], icons: ['latex', 'mathematica', 'cpp'] }} />
</Container>
