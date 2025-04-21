import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

export default function InstructionInput({ instructions, onChange }) {
    const addStep = () => {
        onChange([...instructions, '']);
      };
    
    const updateStep = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        onChange(newInstructions);
    };

    const removeStep = (index) => {
        if (instructions.length > 1) {
            const newInstructions = [...instructions];
            newInstructions.splice(index, 1);
            onChange(newInstructions);
        }
    };

    return (
        <div className="space-y-3">
            {instructions.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <div className="w-6 text-xl font-bold text-gray-700">
                        {index + 1}.
                    </div>
                    <input
                        type="text"
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder={`Describe step ${index + 1}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeStep(index)}
                        disabled={instructions.length === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button 
                type="button"
                variant="outline" 
                onClick={addStep}
                className="w-full text-sm"
            >
                <Plus className="mr-1 h-3 w-3" /> 
                Add Step
            </Button>
        </div>
    );
}