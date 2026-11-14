import logoMdm from "@/assets/logo-mdm.png";

interface LogoProps {
  /** altura da marca "MDM" em px */
  height?: number;
  /** mostra "CORRETORA DE SEGUROS" abaixo */
  subtitle?: boolean;
  /** cor do subtítulo: escura para fundos claros, clara para fundos escuros */
  tone?: "light" | "dark";
  className?: string;
}

export const Logo = ({ height = 40, subtitle = true, tone = "dark", className = "" }: LogoProps) => (
  <div className={`inline-flex flex-col items-center shrink-0 ${className}`} aria-label="MDM Corretora de Seguros">
    <img src={logoMdm} alt="MDM Corretora de Seguros" style={{ height }} className="w-auto max-w-none select-none" draggable={false} />
    {subtitle && (
      <div className="flex items-center gap-1.5 w-full" style={{ marginTop: height * 0.08 }}>
        <span className="h-px flex-1 bg-blue-600" />
        <span
          className={`font-semibold uppercase whitespace-nowrap ${tone === "light" ? "text-blue-200" : "text-blue-800"}`}
          style={{ fontSize: Math.max(7, height * 0.17), letterSpacing: "0.22em" }}
        >
          Corretora de Seguros
        </span>
        <span className="h-px flex-1 bg-blue-600" />
      </div>
    )}
  </div>
);
