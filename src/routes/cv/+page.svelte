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
	import ExperienceBulletpoint from '$lib/components/cv/ExperienceBulletpoint.svelte';
</script>

<Container
	classString="prose-h2:mb-4 prose-h2:mt-12 dark:prose-h2:text-zinc-300 prose-h2:text-zinc-700 prose-h2:text-3xl prose-h2:font-extrabold overflow-x-hidden"
>
	<h1>Curriculum Vitae</h1>
	<SectionHeader>Work experience</SectionHeader>
	<Experience
		data={{
			date_start: 'January 2023',
			date_end: 'Current',
			position: 'Computer Vision Engineer',
			employer: 'Grazper Technologies',
			image: '/cv/grazper_circle.svg'
		}}
	>
		<ExperienceBulletpoint
			>Filed 3 patent applications and owned dataset/model licensing compliance — including
			identifying a licensing issue tainting training data and derived models, and driving a
			full re-annotation remediation.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Designed a multi-camera 3D pose auto-annotation pipeline: cross-camera association,
			uncertainty-weighted triangulation in JAX, and optimisation-based temporal filtering. Over
			95% of frames met or exceeded human annotation quality on many sequences.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Patched YOLO26 and RTMO to expose per-keypoint uncertainty at inference; calibrated raw
			outputs to pixel-scale errors for downstream 3D reconstruction.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Built an internal MLOps platform over PostgreSQL — deterministic, cached, distributed
			component execution powering annotation, evaluation, and training-data pipelines.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Owned pose-model training end-to-end: custom dataset loaders, augmentations, and
			fine-tuning for production conditions.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Built full-stack internal tools (Python + Svelte): a multi-camera ArUco calibration tool
			(sub-cm accuracy at 5–10 m, patent filed) and a microservice orchestration manager
			UI.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Co-maintained core infrastructure as one of two go-to engineers: PostgreSQL, Docker,
			GitHub Actions, Grafana, and MLflow.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Tracked CV/ML literature and presented internal deep-dives on pose estimation, tracking,
			and monocular 3D methods.</ExperienceBulletpoint
		>
	</Experience>
	<Experience
		data={{
			date_start: 'June 2021',
			date_end: 'Current',
			position: 'Senior Scientific Editor (volunteer)',
			employer: 'The Science Breaker',
			image: '/cv/tsb-logo-small.svg'
		}}
	>
		<ExperienceBulletpoint
			>Edit layperson summaries of peer-reviewed research for clarity and style.</ExperienceBulletpoint
		>
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
		<ExperienceBulletpoint
			>Pivoted from pure to applied mathematics ~2 years in. Thesis on low-rank tensor methods,
			randomized linear algebra, and applications to machine learning.</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Published 5 papers; 3 accompanied by open-source Python libraries (computational algebra,
			numerical linear algebra, and machine learning).</ExperienceBulletpoint
		>
		<ExperienceBulletpoint
			>Taught 3 courses per year as an assistant, receiving consistent positive feedback from
			students.</ExperienceBulletpoint
		>
	</Experience>

	<SectionHeader>Education</SectionHeader>

	<Education
		data={{
			date_start: '2018/03',
			date_end: '2022/12',
			entry: [{ title: 'PhD in Applied Mathematics', university: 'University of Geneva' }]
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
				{
					title: 'Bsc. Mathematics and Physics & Astronomy (double degree)',
					university: 'Utrecht University',
					note: 'cum laude'
				}
			]
		}}
	/>

	<SectionHeader>Programming skills</SectionHeader>
	<Skill
		data={{
			title: 'Languages',
			skills: ['Python', 'TypeScript/JavaScript', 'Rust', 'C/C++', 'SQL', 'LaTeX']
		}}
	/>

	<Tool
		data={{
			title: 'ML & CV',
			tools: ['PyTorch', 'JAX', 'Ultralytics', 'ONNX', 'OpenCV', 'SciPy']
		}}><BrainCog /></Tool
	>

	<Tool
		data={{
			title: 'Data',
			tools: ['NumPy', 'pandas', 'polars', 'matplotlib', 'plotly']
		}}><Database /></Tool
	>

	<Tool data={{ title: 'Backend & database', tools: ['FastAPI', 'Flask', 'PostgreSQL', 'SQLAlchemy'] }}
		><Network /></Tool
	>

	<Tool data={{ title: 'Frontend', tools: ['Svelte', 'Tailwind'] }}><Layout /></Tool>

	<Tool
		data={{
			title: 'MLOps & infra',
			tools: ['Docker', 'Linux', 'Git', 'GitHub Actions', 'Grafana', 'MLflow']
		}}><LucideContainer /></Tool
	>

	<Tool data={{ title: 'Numerical', tools: ['CVXPY', 'NumPy', 'SciPy'] }}><Sigma /></Tool>

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
			skills: ['French', 'Danish'],
			icons: ['<span class="fi fi-fr"></span>', '<span class="fi fi-dk"></span>']
		}}
	/>

	<Skill
		data={{
			title: 'Basic (A1-A2)',
			skills: ['Japanese', 'Russian', 'Spanish'],
			icons: [
				'<span class="fi fi-jp "></span>',
				'<span class="fi fi-ru"></span>',
				'<span class="fi fi-es"></span>'
			]
		}}
	/>

	<SectionHeader>Technical writing</SectionHeader>

	<OpenSource
		data={{
			url: '/blog',
			title: 'rikvoorhaar.com/blog — 19 technical posts',
			info: `ML/CV, uncertainty quantification, numerical methods, and performance engineering.`
		}}
	/>
	<OpenSource
		data={{
			url: '/blog/discrete_function_tensor',
			title: 'Machine learning with discretized functions and tensors',
			info: `Accessible explainer of the TTML paper — tensor trains for supervised machine learning.`
		}}
	/>
	<OpenSource
		data={{
			url: '/blog/ukf',
			title: 'Kalman filters and how I made them 20× faster using Rust',
			info: `High-performance Unscented Kalman Filter in Rust/PyO3 for multi-camera tracking.`
		}}
	/>
	<OpenSource
		data={{
			url: '/blog/deconvolution_part1',
			title: 'Blind deconvolution (4-part series)',
			info: `Wiener filtering, sparse image priors, Richardson–Lucy, and Bayesian blind deconvolution.`
		}}
	/>

	<SectionHeader>Publications</SectionHeader>
	<Publication
		data={{
			date: 'December 2022 (PhD thesis)',
			title:
				'Tensor Train Approximations: Riemannian Methods, Randomized Linear Algebra and Applications to Machine Learning',
			url: 'https://doi.org/10.13097/archive-ouverte/unige:166308',
			info: `This is my PhD thesis, which is mostly an extended version of my two papers together with Bart Vandereycken, together with a comprehensive preliminaries section. You can also find slides for my oral defense <a href="https://github.com/RikVoorhaar/website/raw/master/jekyll/_data/presentation.pdf">by clicking here.</a>`
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
			date: 'October 2018',
			title: 'Parallel 2-transport and 2-group torsors',
			url: 'https://arxiv.org/abs/1811.10060',
			info: `This work is a continuation of my masters thesis. The idea is to study a toy model of principal 2-bundles and 2-transport by restricting to a stricter notion, where the fibers are all strict 2-groups. This allows to get some nice generalizations of the classical theory, which would be harder to proof in the more general setting.`
		}}
	/>

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
</Container>
