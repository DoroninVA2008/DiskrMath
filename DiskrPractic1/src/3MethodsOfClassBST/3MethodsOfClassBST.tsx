import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

class TreeNode {
    value: number;
    left: TreeNode | null = null;
    right: TreeNode | null = null;

    constructor(value: number) {
        this.value = value;
    }
}

class BST {
    root: TreeNode | null = null;

    insert(value: number) {
        const newNode = new TreeNode(value);
        if (this.root === null) {
            this.root = newNode;
            return;
        }
        this.insertNode(this.root, newNode);
    }

    private insertNode(node: TreeNode, newNode: TreeNode) {
        if (newNode.value < node.value) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    search(value: number): boolean {
        return this.searchNode(this.root, value);
    }

    private searchNode(node: TreeNode | null, value: number): boolean {
        if (node === null) {
            return false;
        }
        if (value < node.value) {
            return this.searchNode(node.left, value);
        } else if (value > node.value) {
            return this.searchNode(node.right, value);
        }
        return true;
    }

    inOrderTraversal(node: TreeNode | null, result: number[] = []): number[] {
        if (node) {
            this.inOrderTraversal(node.left, result);
            result.push(node.value);
            this.inOrderTraversal(node.right, result);
        }
        return result;
    }
}

const Task3: React.FC = () => {
    const [bst] = useState(new BST());
    const [traversalResult, setTraversalResult] = useState<number[]>([]);
    
    // Вставляем значения в BST
    const valuesToInsert = [15, 6, 18, 3, 7, 17, 20, 4, 13, 9];
    
    valuesToInsert.forEach(value => bst.insert(value));

    const handleTraversal = () => {
        const result = bst.inOrderTraversal(bst.root);
        setTraversalResult(result);
    };

    return (
        <div className="app-container">
            <h1>Упражнение 3</h1>
            <button onClick={handleTraversal}>Тестировать</button>
            <div>
              <h2>ПроТестировать методы класса BST:</h2>
              <p>{traversalResult.join(', ')}</p>
            </div>
            <Link to="/2nTask">
              <button>
                Предыдущий алгоритм
              </button>
            </Link>
        </div>
    );
};

export default Task3;
