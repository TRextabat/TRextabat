<p align="center">
  <img src="./assets/header.svg" alt="Amir Amiri Tabat — Bioinformatics, AI systems, and backend engineering" width="100%">
</p>

<p align="center">
  <a href="https://github.com/BMGLab"><img src="https://img.shields.io/badge/BMGLab-18181B?style=for-the-badge&logo=github&logoColor=7DD3FC" alt="BMGLab"></a>
  <a href="https://github.com/Single-Cell-Quest"><img src="https://img.shields.io/badge/Single--Cell--Quest-18181B?style=for-the-badge&logo=github&logoColor=C4B5FD" alt="Single-Cell Quest"></a>
  <a href="https://github.com/MemoryUniverse"><img src="https://img.shields.io/badge/Memory_Universe-18181B?style=for-the-badge&logo=github&logoColor=86EFAC" alt="Memory Universe"></a>
</p>

I'm a backend engineer and bioinformatics researcher based in İzmir. I enjoy the less glamorous parts of software—the data models, failure handling, pipelines, and tests that make a system dependable. My recent work has focused on agent memory and single-cell RNA sequencing.

## What I'm working on

### Memory Universe

Every new agent session tends to start the same way: explain the project again, recover old decisions, and hope nothing important was lost in another chat. **[Memory Universe](https://github.com/MemoryUniverse/mu-core)** is my attempt to fix that.

It keeps a structured history of decisions, tasks, evidence, and constraints, then brings the relevant parts into later sessions. The local memory engine, capture client, and Python and TypeScript SDKs are built and being used with Claude Code and Codex. I'm now working on the harder team problem: sharing context across people and different agents without making all private context visible to everyone.

The design uses separate local and shared memory, provenance for transferred context, and permissions that can expire or be revoked. It is also the subject of my undergraduate thesis on multi-user, long-horizon memory for agents.

### PeakATail

At **[BMGLab](https://github.com/BMGLab)**, I lead development of **[PeakATail](https://github.com/BMGLab/PeakATail)**, a Python package for studying alternative polyadenylation in single-cell RNA-seq data.

PeakATail starts from tagged BAM files produced by tools such as STARsolo and CellRanger. It calls poly(A) sites at read level, creates per-cell count matrices, clusters cells by their APA profiles, and supports differential APA testing, 3′ UTR length analysis, and cross-dataset cluster matching. The package is currently being benchmarked against reference poly(A) databases while we prepare the manuscript.

Alongside research code, I've worked on production backends, LLM routing and agent workflows, document-processing pipelines, real-time APIs, observability, and Linux infrastructure. I also led the IEEE Ege bioinformatics team and helped organize more than twelve technical workshops.

## A few other projects

| | Project | Why it matters |
|:--:|---|---|
| 🔬 | **[Bioinformatics Tutorials](https://github.com/IEEE-Ege/BioinformaticTutorials)** | Makes foundational bioinformatics problems approachable through hands-on Python workshops. |
| 🛡️ | **[MCP Tool Poisoning Demo](https://github.com/TRextabat/valun_project)** | A small vulnerable/secure pair showing how poisoned tool descriptions can manipulate an agent. |
| 🔐 | **[Secure UDP Chat](https://github.com/TRextabat/net_sec)** | Combines authenticated messaging, Argon2id, rate limits, token revocation, and session expiry. |
| 📈 | **[LSTM Price Prediction](https://github.com/TRextabat/CIDL-Project1-LSTM-Price-Prediction)** | Compares four LSTM architectures with walk-forward validation and reproducible experiments. |

## Toolkit

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,go,pytorch,fastapi,django,postgres,redis,docker,kubernetes,linux,git&perline=11" alt="Python, Go, PyTorch, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, Linux, and Git">
</p>

## By the numbers

<p align="center">
  <img height="170" src="https://github-readme-stats.vercel.app/api?username=TRextabat&show_icons=true&hide_border=true&rank_icon=github&theme=transparent&title_color=38BDF8&icon_color=A78BFA&text_color=71717A" alt="Amir's GitHub stats">
  <img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=TRextabat&layout=compact&hide_border=true&theme=transparent&langs_count=6&title_color=38BDF8&text_color=71717A" alt="Most used languages">
</p>

<p align="center">
  <a href="mailto:amiramiritabat01@gmail.com"><img src="https://img.shields.io/badge/Email-18181B?style=for-the-badge&logo=gmail&logoColor=EA4335" alt="Email"></a>
  <a href="https://www.linkedin.com/in/amir-amiritabat-71190724b"><img src="https://img.shields.io/badge/LinkedIn-18181B?style=for-the-badge&logo=linkedin&logoColor=0A66C2" alt="LinkedIn"></a>
</p>
