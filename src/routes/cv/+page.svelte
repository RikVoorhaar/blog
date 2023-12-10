<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Experience from '$lib/components/cv/Experience.svelte';
	import Education from '$lib/components/cv/Education.svelte';
	import Skill from '$lib/components/cv/Skill.svelte';
	import Tool from '$lib/components/cv/Tool.svelte';
	import { BrainCog, Database, Layout, LucideContainer, Network, Sigma } from 'lucide-svelte';
	import '/node_modules/flag-icons/css/flag-icons.min.css';
	import Publication from '$lib/components/cv/Publication.svelte';
	import OpenSource from '$lib/components/cv/OpenSource.svelte';
	import SectionHeader from '$lib/components/cv/SectionHeader.svelte';
</script>

<Container
	classString="prose-h2:mb-4 prose-h2:mt-12 dark:prose-h2:text-zinc-300 prose-h2:text-zinc-700 prose-h2:text-3xl prose-h2:font-extrabold overflow-x-hidden"
>
	<h1>Curriculum Vitae</h1>
	<SectionHeader>Work experience</SectionHeader>
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

	<SectionHeader>Education</SectionHeader>

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

	<SectionHeader>Programming skills</SectionHeader>
	<Skill
		data={{
			title: 'Languages',
			skills: [
				'Python',
				'LaTeX',
				'Mathematica',
				'C/C++',
				'HTML/CSS',
				'Typescript/Javascript',
				'Rust'
			]
		}}
	/>

	<Tool
		data={{
			title: 'Data science',
			tools: ['Matplotlib', 'Pandas', 'Plotly', 'Polars', 'SQL', 'SQLAlchemy']
		}}><Database /></Tool
	>

	<Tool data={{ title: 'Frontend', tools: ['Svelte', 'Tailwind'] }}><Layout /></Tool>
	<Tool
		data={{ title: 'Machine Learning', tools: ['OpenCV', 'PyTorch', 'Scikit-learn', 'XGboost'] }}
	>
		<BrainCog /></Tool
	>
	<Tool data={{ title: 'Devops', tools: ['Docker', 'Git', 'Jenkins', 'Linux', 'Vim', 'VSCode'] }}
		><LucideContainer /></Tool
	>
	<Tool data={{ title: 'Numerical', tools: ['CVXPY', 'Cython', 'Numpy', 'SciPy'] }}><Sigma /></Tool>
	<Tool data={{ title: 'Networking', tools: ['FastAPI', 'Flask'] }}><Network /></Tool>

	<SectionHeader>Languages</SectionHeader>

	<Skill
		data={{
			title: 'Native/bilingual',
			skills: ['Dutch', 'English'],
			icons: ['<span class="fi fi-nl"></span>', '<span class="fi fi-us"></span>']
		}}
	/>

	<Skill
		data={{
			title: 'Intermediate (B1-B2)',
			skills: ['French'],
			icons: ['<span class="fi fi-fr"></span>']
		}}
	/>

	<Skill
		data={{
			title: 'Basic (A1-A2)',
			skills: ['Japanese', 'Russian', 'Spanish', 'Danish'],
			icons: [
				'<span class="fi fi-jp "></span>',
				'<span class="fi fi-ru"></span>',
				'<span class="fi fi-es"></span>',
				'<span class="fi fi-dk"></span>'
			]
		}}
	/>

	<SectionHeader>Online courses</SectionHeader>
	<Education
		data={{
			date_start: '2021/02',
			entry: [
				{
					title: 'Neuroscience and Neuroimaging Specialization',
					university: 'John Hopkins University',
					note: '<a href="https://www.coursera.org/account/accomplishments/specialization/REWS86DYU496">Coursera certificate </a>'
				}
			]
		}}
	/>
	<Education
		data={{
			date_start: '2020/09',
			entry: [
				{
					title: 'Genomic Datascience Specialization',
					university: 'John Hopkins University',
					note: '<a href="https://www.coursera.org/account/accomplishments/specialization/NYQNJVCT7XV3">Coursera certificate </a>'
				}
			]
		}}
	/>
	<Education
		data={{
			date_start: '2019/08',
			entry: [
				{
					title: 'Advanced Machine Learning Specialization',
					university: 'Higher School of Economics',
					note: '<a href="https://www.coursera.org/account/accomplishments/specialization/5BM8U5DJJCJN">Coursera certificate </a>'
				}
			]
		}}
	/>

	<SectionHeader>Publications</SectionHeader>
	<Publication
		data={{
			date: 'December 2022 (PhD thesis)',
			title:
				'Tensor Train Approximations: Riemannian Methods, Randomized Linear Algebra and Applications to Machine Learning',
			url: 'https://doi.org/10.13097/archive-ouverte/unige:166308',
			info: `This is my PhD thesis, which is mostly an extended version of my two papers together with Bart Vandereycken, together with a comphrensive preliminaries section. You can also find slides for my oral defense <a href="https://github.com/RikVoorhaar/website/raw/master/jekyll/_data/presentation.pdf">by clicking here.</a>`
		}}
	/>
	<Publication
		data={{
			date: 'August 2022',
			title: 'Streaming Tensor Train Approximation',
			url: 'https://doi.org/10.1137/22M1515045',
			published: 'SIAM Journal on Scientific Computing',
			coauthors: ['Bart Vandereycken', 'Daniel Kressner'],
			info: `Inspired by the generalized Nyström approximation for low-rank matrices, we created a randomized streaming algorithm for computing tensor trains. This algorithm can quickly compute accurate approximations of a wide variety of tensors (multi-dimensional arrays). It does this by 'sketching' the tensor by multiplying with random tensors to quickly find a small subspace in which it is easy to approximate the tensor. This is a streaming algorithm, which means that we only need to do a single pass over the data of the tensor we want to approximate. It also means it works really well in a distributed setting, and scales very well to big data.`
		}}
	/>
	<Publication
		data={{
			date: 'March 2022',
			title: 'TTML: tensor trains for general supervised machine learning',
			url: 'https://doi.org/10.48550/arXiv.2203.04352',
			coauthors: ['Bart Vandereycken'],
			info: `We describe how to use tensor trains to parametrize discretized functions, and how to get a useful supervised machine learning estimator out of it. Learning and initializing these tensor trains is a bit tricky, but definitely doable. I also wrote <a href="/blog/discrete_function_tensor">a blog post</a> about this paper, explaining the main ideas in a more accessible way.`
		}}
	/>
	<Publication
		data={{
			date: 'April 2021',
			title: 'On certain Hochschild cohomology groups for the small quantum group',
			url: 'https://doi.org/10.1016/j.jalgebra.2022.04.034',
			coauthors: ['Nicolas Hemelsoet'],
			published: 'Journal of Algebra',
			info: `We apply the algorithm for the BGG resolution developed in the previous paper to compute Hochschild cohomology of blocks of the small quantum group. This allows us to study the center of the small quantum group, and our computations give stronger evidence for several conjectures concerning the small quantum group. My contribution was writing all the code needed for this project.`
		}}
	/>
	<Publication
		data={{
			date: 'November 2019',
			title: 'A computer algorithm for the BGG resolution',
			url: 'https://doi.org/10.1016/j.jalgebra.2020.09.043',
			coauthors: ['Nicolas Hemelsoet'],
			published: 'Journal of Algebra',
			info: `In this work we describe an algorithm to compute the BGG resolution for modules over a simple Lie algebra. This is then used to compute various thing like the Hochschild cohomology of some flag varieties. My contribution was coding the implementation of the algorithm, and solving several algorithmic problems.`
		}}
	/>
	<Publication
		data={{
			date: 'Ocrober 2018',
			title: 'Parallel 2-transport and 2-group torsors',
			url: 'https://arxiv.org/abs/1811.10060',
			info: `This work is a continuation of my masters thesis. The idea is to study a toy model of principal 2-bundles and 2-transport by restricting to a stricter notion, where the fibers are all strict 2-groups. This allows to get some nice generalizations of the classical theory, which would be harder to proof in the more general setting.`
		}}
	/>
	<!-- <Publication
		data={{
			date: 'February 2018 (master thesis)',
			title: 'Higher Gauge Theory',
			url: 'https://dspace.library.uu.nl/handle/1874/361953'
		}}
	/> -->

	<SectionHeader>Open source contributions</SectionHeader>

	<OpenSource
		data={{
			url: 'https://github.com/RikVoorhaar/tt-sketch',
			title: 'tt-sketch python package',
			info: `A randomized streaming algorithm for computing tensor trains. This library implements several fast algorithms for approximating tensors by tensor trains. It is written in an abstract object-oriented fashion, and it is very easy to extent. It supports quite a few different types of tensors.`
		}}
	/>
	<OpenSource
		data={{
			url: 'https://github.com/RikVoorhaar/ttml',
			title: 'ttml python package',
			info: `A novel machine learning estimator based on Tensor Trains. I wrote this library by myself, and includes many features for optimizing tensor trains in addition to the machine learning capabilities.`
		}}
	/>
	<OpenSource
		data={{
			url: 'https://github.com/RikVoorhaar/bgg-cohomology',
			title: 'bgg-cohomology sage package',
			info: `I wrote a Sagemath package used for computing the BGG resolution of simple Lie algebra modules and the associated cohomology.`
		}}
	/>
	<OpenSource
		data={{
			url: 'https://github.com/geoopt/geoopt',
			title: 'geoopt',
			info: `This is a package for Riemannian optimization using PyTorch. I added a Riemannian line search and conjugate gradient optimizer to this project.`
		}}
	/>
	<OpenSource
		data={{
			url: 'https://github.com/jcmgray/autoray',
			title: 'autoray',
			info: `This is a package meant to help writing backend agnostic code, i.e. code that can manipulate objects from different numerical libraries like numpy, tensorflow or pytorch (among others). I added a few extra translations from the numpy API to other libraries, I improved the functionality to infer the backend of the arguments of some functions, and I made data type handling for array creation operations more consistent.`
		}}
	/>
	<OpenSource
		data={{
			url: 'https://scipy.org/',
			title: 'scipy',
			info: `Fixed a bug preventing <tt>scipy.linalg.lu_factor</tt> only accepting square matrices. Additionally discovered performance issues with the implementation of the matrix logarithm <tt>scipy.linalg.logm</tt>.`
		}}
	/>
</Container>
