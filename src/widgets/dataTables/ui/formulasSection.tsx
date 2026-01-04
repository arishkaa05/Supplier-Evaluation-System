import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

const FormulasSection: React.FC = () => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold">3) Формулы, которые используются</h2>

      <div className="mt-4  flex flex-col  gap-6"> 
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="font-semibold mb-2">
            Direction determinant для{" "}
            <InlineMath math={String.raw`A^\uparrow=[a,b,b,c]`} /> (6)
          </div>
 

          <div className="mt-3">
            <BlockMath
              math={String.raw`D_{A\uparrow}(x^*)=
\begin{cases}
\dfrac{x^*-b}{b-a}, & x^*\in(a,b]\\[6pt]
\dfrac{x^*-b}{c-b}, & x^*\in(b,c)
\end{cases}`}
            />
          </div>
        </div>
 
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="font-semibold mb-2">
            Direction determinant для{" "}
            <InlineMath math={String.raw`A^\downarrow=[d,e,e,f]`} /> (7)
          </div>
 

          <div className="mt-3">
            <BlockMath
              math={String.raw`D_{A\downarrow}(x^*)=
\begin{cases}
\dfrac{x^*-e}{e-f}-\rho, & x^*\in(f,e]\\[8pt]
\dfrac{x^*-e}{d-e}-\rho, & x^*\in(e,d)
\end{cases}`}
            />
          </div>
        </div>
 
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="font-semibold mb-2">Strength of  complex ordered fuzzy rule(8)</div>
 

          <div className="mt-3">
            <BlockMath
              math={String.raw`D_A=\frac{1}{n}\sum_{i=1}^{n}\varepsilon_i\,D_{A_i}(x_i^*),\qquad n=3`}
            />
          </div>
        </div>
 
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="font-semibold mb-2">
            DIMS-импликация для положительного{" "}
            <InlineMath math={String.raw`B=[k,l,l,m]`} /> (9)
          </div>

          <div className="text-sm text-slate-600">
            Если <InlineMath math={String.raw`D_A>0`} />, сдвиг к{" "}
            <InlineMath math={String.raw`[m,m,m,m]`} />; если{" "}
            <InlineMath math={String.raw`D_A\le 0`} />, к{" "}
            <InlineMath math={String.raw`[k,k,k,k]`} />.
          </div>

          <div className="mt-3">
            <BlockMath
              math={String.raw`B'=
\begin{cases}
[k,l,l,m]+|D_A|\big([k,k,k,k]-[k,l,l,m]\big), & D_A\le 0\\[6pt]
[k,l,l,m]+|D_A|\big([m,m,m,m]-[k,l,l,m]\big), & D_A>0
\end{cases}`}
            />
          </div>
        </div>

       <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
  <div className="font-semibold mb-2">
    DIMS-импликация для отрицательного{" "}
    <InlineMath math={String.raw`B=[k,l,l,m]`} /> (10)
  </div>
 
  <div className="mt-3">
    <BlockMath
      math={String.raw`B'=
\begin{cases}
[k,l,l,m]+|D_A|\big([m,m,m,m]-[k,l,l,m]\big), & D_A\le 0\\[6pt]
[k,l,l,m]+|D_A|\big([k,k,k,k]-[k,l,l,m]\big), & D_A>0
\end{cases}`}
    />
  </div>
</div>


        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 lg:col-span-2">
          <div className="font-semibold mb-2">Дефаззификация (11)</div>

          <div className="text-sm text-slate-600">
            Для <InlineMath math={String.raw`B'=[a',b',b',c']`} />. В примере{" "}
            <InlineMath math={String.raw`\mu=0.8`} />.
          </div>

          <div className="mt-3">
            <BlockMath
              math={String.raw`\varphi(B')=\frac{\mu a' + b' + (2-\mu)c'}{3}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormulasSection;
