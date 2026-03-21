/**
 * @module SafeImage
 * @description Componente envoltorio genérico para proteger la carga de imágenes dinámicas y estables.
 * @inputs src (ruta), fallbackType (tipo de render fallido), className, children.
 * @actions Intenta cargar imagen prioritaria; si falla por 404/Error, activa el esqueleto SVG por defecto correspondiente de forma transparente.
 * @files src/components/SafeImage.tsx
 */
import React, { useState } from 'react';
import clsx from 'clsx';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'svg' | 'jpg' | 'png';
  wrapperClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackType = 'svg', 
  className,
  wrapperClassName,
  alt,
  ...props 
}) => {
  const [error, setError] = useState(false);

  const getFallbackSrc = () => {
    switch (fallbackType) {
      case 'jpg': return '/generics/JPG_Generico.jpg';
      case 'png': return '/generics/PNG_Generico.png';
      case 'svg': 
      default: return '/generics/SVG_Generico.svg';
    }
  };

  return (
    <div className={clsx("relative flex items-center justify-center overflow-hidden", wrapperClassName)}>
      <img
        src={error ? getFallbackSrc() : src}
        className={clsx("object-contain transition-opacity duration-300", className)}
        onError={() => {
          if (!error) setError(true);
        }}
        alt={alt || "Safe Image"}
        {...props}
      />
    </div>
  );
};
