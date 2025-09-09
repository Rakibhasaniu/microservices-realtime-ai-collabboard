export class DiagramService {
  async generateMermaidDiagram(description: string, type: string): Promise<string> {
    // Simple rule-based diagram generation
    const cleanDesc = description.toLowerCase();
    
    switch (type) {
      case 'flowchart':
        return this.generateFlowchart(cleanDesc);
      case 'sequence':
        return this.generateSequenceDiagram(cleanDesc);
      case 'class':
        return this.generateClassDiagram(cleanDesc);
      default:
        return this.generateFlowchart(cleanDesc);
    }
  }

  private generateFlowchart(description: string): string {
    // Extract key entities and actions
    const steps = this.extractSteps(description);
    
    let mermaid = 'graph TD\n';
    
    if (steps.length === 0) {
      return `graph TD
    A[${description.slice(0, 30)}...] --> B[Process]
    B --> C[Result]`;
    }
    
    steps.forEach((step, index) => {
      const current = String.fromCharCode(65 + index); // A, B, C...
      const next = String.fromCharCode(65 + index + 1);
      
      mermaid += `    ${current}[${step}]\n`;
      
      if (index < steps.length - 1) {
        mermaid += `    ${current} --> ${next}\n`;
      }
    });
    
    return mermaid;
  }

  private generateSequenceDiagram(description: string): string {
    return `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request
    System->>Database: Query
    Database-->>System: Response
    System-->>User: Result`;
  }

  private generateClassDiagram(description: string): string {
    return `classDiagram
    class Entity {
        +id: string
        +name: string
        +createdAt: Date
        +update()
        +delete()
    }`;
  }

  private extractSteps(description: string): string[] {
    // Simple extraction logic
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 5).map(s => s.trim().slice(0, 20) + (s.length > 20 ? '...' : ''));
  }
}