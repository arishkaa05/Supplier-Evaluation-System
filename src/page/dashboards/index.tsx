 import { FuzzyResultTable } from "@/feature/calculations";
import { areas, symptomsByParamId } from "@/shared/config/data/preparingknowledgeBase";
import result from "@/feature/calculations/model/math";
import { useState, useMemo, FC, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import { LayoutDashboard } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
 
const Dashboards = () => {
  console.log('12345', symptomsByParamId, areas, result(1))
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <LayoutDashboard size={24} strokeWidth={1} />
        <h4 className="text-4xl font-bold">Дашборды</h4>
      </div>
      <FuzzyResultTable />

      <ResultCard />
    </div>
  );
};

export default Dashboards;  
  

type Area = {
  id: number | string;
  name_area: string;
  status: "2" | "6" | string;
  answer?: string;
  explanation?: string[];
};

type Props = {
  selectedPatientId?: string;
};

const StatusBadge:FC<{ status: string }> = ({ status }) => {
  if (status === "1") return <Badge>Не подходит ({status})</Badge>;
  if (status === "2") return <Badge>Подходит ({status})</Badge>;
  if (status === "6") return <Badge variant="secondary">Может подходить ({status})</Badge>;
  if (status === "5") return <Badge variant="secondary">Может не подходить ({status})</Badge>;
  return <Badge variant="outline">Статус: ({status})</Badge>;
};

export const ResultCard:FC<Props> = ({ selectedPatientId }) => {
  const [resultArea, setResultArea] =useState<Area[]>([]);
  const [moreInformation, setMoreInformation] =useState(false);

  const summary =useMemo(() => {
    const suitable = resultArea.filter((a) => a.status === "2");
    const maybe = resultArea.filter((a) => a.status === "6");

    return {
      suitable,
      maybe,
      suitableNames: suitable.map((a) => a.name_area),
      maybeNames: maybe.map((a) => a.name_area),
    };
  }, [resultArea]);

  const getResult =   () => {
    setMoreInformation(false);

     const response =   result(1) 
    setResultArea(Array.isArray(response) ? response : []);
  };

  useEffect(() => {getResult()}, [])

  return (
    <Card className="mt-3 mb-20 shadow-xl">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl text-center">Результат</CardTitle>

        <div className="flex items-center justify-center gap-2">
          <Button onClick={getResult}>Получить результат по пациенту</Button>

          {!!resultArea.length && (
            <Button
              variant="secondary"
              onClick={() => setMoreInformation((v) => !v)}
            >
              {moreInformation ? "Скрыть детали" : "Показать больше информации"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!resultArea.length ? (
          <div className="text-sm text-muted-foreground text-center">
            Нажмите кнопку, чтобы получить результат.
          </div>
        ) : (
          <>  
            <div className="space-y-2">
              {summary.suitableNames.length > 0 && (
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-sm font-medium">
                    Правила, которые подходят:
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.suitableNames.map((n) => (
                      <Badge key={n}>{n}</Badge>
                    ))}
                  </div>
                </div>
              ) }

              {summary.maybeNames.length > 0 && (
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-sm font-medium">
                    Могут подходить (на опыте эксперта):
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                     {summary.maybeNames.map((n) => (
                      <Badge key={n} variant="secondary">
                    {n}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

                  <>
                <Separator />
                <div className="w-full">
                  {resultArea.filter((a) =>  a.status !== "1").map((area) => {
                    const title = area.answer ?? area.name_area ?? `Area ${area.id}`;
                    return (
                      <div key={String(area.id)} >

                  {/* {JSON.stringify(area)} */}
                        <div className="text-left">
                          <div className="flex w-full items-center justify-between gap-3 pr-2">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{title}</div>
                              {/* <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{area.name_area}</span>
                              </div> */}
                            </div>

                            <div className="shrink-0">
                              <StatusBadge status={area.status} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="space-y-2">
                            {Array.isArray(area.explanation) && area.explanation.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {area.explanation.map((line, idx) => (
                                  <li key={idx}>{line}</li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Нет пояснения для этой области.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            </div>

            {moreInformation && (
              <>
                <Separator />
                <Accordion type="single" collapsible className="w-full">
                  {resultArea.map((area) => {
                    const title = area.answer ?? area.name_area ?? `Area ${area.id}`;
                    return (
                      <AccordionItem key={String(area.id)} value={String(area.id)}>
                        <AccordionTrigger className="text-left">
                          <div className="flex w-full items-center justify-between gap-3 pr-2">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{title}</div>
                              {/* <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{area.name_area}</span>
                              </div> */}
                            </div>

                            <div className="shrink-0">
                              <StatusBadge status={area.status} />
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent>
                          <div className="space-y-2">
                            {Array.isArray(area.explanation) && area.explanation.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {area.explanation.map((line, idx) => (
                                  <li key={idx}>{line}</li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Нет пояснения для этой области.
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
