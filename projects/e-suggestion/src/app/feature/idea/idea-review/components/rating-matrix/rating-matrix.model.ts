type Criterion = {
    key: string;
    name: string;
    options: { value: number; label: string }[];
  };

// Critères de Résultat
export const ResultCriteria: Criterion[] = [
    {
      key: 'quality',
      name: 'Qualité',
      options: [
        { value: 0, label: "Pas d'impact" },
        { value: 10, label: "Élimination d'un défaut (impact interne)" },
        { value: 20, label: 'Élimination complète (impact client interne)' },
        { value: 30, label: 'Élimination complète (impact client externe)' },
      ],
    },
    {
      key: 'cost_reduction',
      name: 'Réduction des coûts',
      options: [
        { value: 0, label: 'Pas de gain' },
        { value: 10, label: 'Gain annuel faible' },
        { value: 20, label: 'Gain annuel < 15 000 euros' },
        { value: 30, label: 'Gain annuel > 15 000 euros' },
      ],
    },
    {
      key: 'time_savings',
      name: 'Délais',
      options: [
        { value: 0, label: "Pas d'amélioration" },
        { value: 10, label: 'Impact faible' },
        { value: 20, label: 'Impact moyen' },
        { value: 30, label: 'Impact fort' },
      ],
    },
    {
      key: 'ehs',
      name: 'EHS',
      options: [
        { value: 0, label: 'Contrôles administratifs' },
        { value: 10, label: 'Contrôles techniques' },
        { value: 20, label: 'Substitution' },
        { value: 30, label: 'Élimination' },
      ],
    },
  ];

  // Critères de Processus
  export const ProcessCriteria: Criterion[] = [
    {
      key: 'initiative',
      name: 'Initiative',
      options: [
        { value: 0, label: "Aucune (simple émission d'une idée)" },
        { value: 10, label: "Proposition d'idée" },
        { value: 20, label: 'Contribution pour résoudre le problème' },
        { value: 30, label: "Implémentation de l'idée de façon autonome" },
      ],
    },
    {
      key: 'creativity',
      name: 'Créativité',
      options: [
        { value: 0, label: "-" },
        { value: 10, label: "Adaptation d'une idée existante" },
        { value: 20, label: 'Nouvelle idée avec amélioration significative' },
        { value: 30, label: 'Grande innovation' },
      ],
    },
    {
      key: 'transversalization',
      name: 'Transversalisation',
      options: [
        { value: 0, label: 'Idée appliquée dans une seule ligne' },
        { value: 10, label: 'Idée appliquée à plusieurs lignes' },
        { value: 20, label: "Idée appliquée dans d'autres Value Streams" },
        {
          value: 30,
          label: "Idée appliquée dans d'autres plants ou Business Units",
        },
      ],
    },
    {
      key: 'effectiveness',
      name: "Efficacité de l'idée",
      options: [
        { value: 0, label: "-" },
        { value: 10, label: 'Action corrective' },
        { value: 20, label: 'Traitement partiel du problème' },
        { value: 30, label: 'Traitement de la cause racine' },
      ],
    },
  ];