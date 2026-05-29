import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '../components/futuristic/SectionHeader';
import ProjectLightbox from '../components/futuristic/ProjectLightbox';

gsap.registerPlugin(ScrollTrigger);

// Mapped 1:1 with i18n work.projects order (15 projects from real portfolio)
const projectImages = Array.from(
  { length: 15 },
  (_, i) => `${import.meta.env.BASE_URL}projects/project${i + 1}.png`,
);

export default function Work() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragMoved = useRef(false);  // distinguishes a click from a drag-release

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  const projects = t('work.projects', { returnObjects: true }) as Array<{
    title: string;
    tags: string;
    year: string;
  }>;

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i <= 0 ? projectImages.length - 1 : i - 1)),
    [],
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i >= projectImages.length - 1 ? 0 : i + 1)),
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Entrance animations
    const elements = section.querySelectorAll('.reveal-item');
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      }
    );

    // 3D perspective effect on scroll
    const gallery = galleryRef.current;
    if (!gallery) return;

    const handleScroll = () => {
      const cards = gallery.querySelectorAll('.project-card');
      const galleryCenter = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;

      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = (cardCenter - galleryCenter) / gallery.clientWidth;
        const rotateY = dist * 6;
        (card as HTMLElement).style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
      });
    };

    gallery.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      gallery.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.pageX - (galleryRef.current?.offsetLeft || 0);
    scrollLeft.current = galleryRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - (galleryRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) dragMoved.current = true;  // real drag, not a click
    galleryRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Click on a card → open lightbox (unless we were dragging)
  const handleCardClick = (i: number) => {
    if (dragMoved.current) {
      dragMoved.current = false;  // consume the drag flag, don't open lightbox
      return;
    }
    openLightbox(i);
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      style={{
        padding: '140px 4vw 100px',
        background: 'rgba(4,6,13,0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <SectionHeader num="02" label={t('work.label')} heading={t('work.heading')} />

      {/* Horizontal Scroll Gallery */}
      <div
        ref={galleryRef}
        className="scrollbar-thin flex gap-6 overflow-x-auto cursor-grab active:cursor-grabbing pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: '0',
          paddingRight: '4vw',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {projects.map((project, i) => (
          <div
            key={i}
            data-cursor="hover"
            onClick={() => handleCardClick(i)}
            className="project-card reveal-item flex-shrink-0 relative overflow-hidden group cursor-pointer"
            style={{
              width: '70vw',
              maxWidth: '900px',
              height: '500px',
              scrollSnapAlign: 'start',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
              transformOrigin: 'center center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            {/* Background Image */}
            <img
              src={projectImages[i]}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
              draggable={false}
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(to top, rgba(0,11,31,0.9) 0%, rgba(0,11,31,0.3) 50%, transparent 100%)',
              }}
            />

            {/* Hover View Label */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <span
                className="font-body font-medium text-white uppercase tracking-[0.1em]"
                style={{ fontSize: '14px' }}
              >
                {t('work.viewProject')}
              </span>
            </div>

            {/* Card Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-heading font-semibold text-white" style={{ fontSize: '24px' }}>
                    {project.title}
                  </h3>
                  <p
                    className="font-mono uppercase tracking-[0.1em] mt-2"
                    style={{ fontSize: '12px', color: '#3b82f6' }}
                  >
                    {project.tags}
                  </p>
                </div>
                <span
                  className="font-body text-white flex-shrink-0"
                  style={{ fontSize: '14px', color: '#d2d2d2' }}
                >
                  {project.year}
                </span>
              </div>
            </div>

            {/* Hover scale on image */}
            <style>{`
              .group:hover img {
                transform: scale(1.05);
              }
              .group:hover .absolute:first-of-type + div {
                background: linear-gradient(to top, rgba(0,11,31,0.7) 0%, rgba(0,11,31,0.2) 50%, transparent 100%);
              }
            `}</style>
          </div>
        ))}
      </div>

      {/* Full-screen lightbox modal — opens on card click */}
      <ProjectLightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        images={projectImages}
        projects={projects}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />
    </section>
  );
}
