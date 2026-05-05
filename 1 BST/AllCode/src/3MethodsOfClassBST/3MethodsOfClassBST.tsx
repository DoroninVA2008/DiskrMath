import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

class TreeNode {
  value: number
  left: TreeNode | null = null
  right: TreeNode | null = null

  constructor(value: number) {
    this.value = value
  }
}

class BST {
  root: TreeNode | null = null

  insert(value: number) {
    const node = new TreeNode(value)
    if (this.root === null) {
      this.root = node
      return
    }
    this.insertNode(this.root, node)
  }

  private insertNode(current: TreeNode, newNode: TreeNode) {
    if (newNode.value < current.value) {
      if (current.left === null) current.left = newNode
      else this.insertNode(current.left, newNode)
    } else {
      if (current.right === null) current.right = newNode
      else this.insertNode(current.right, newNode)
    }
  }

  search(value: number): boolean {
    return this.searchNode(this.root, value)
  }

  private searchNode(node: TreeNode | null, value: number): boolean {
    if (node === null) return false
    if (value === node.value) return true
    if (value < node.value) return this.searchNode(node.left, value)
    return this.searchNode(node.right, value)
  }

  inOrderTraversal(node: TreeNode | null, result: number[] = []): number[] {
    if (node) {
      this.inOrderTraversal(node.left, result)
      result.push(node.value)
      this.inOrderTraversal(node.right, result)
    }
    return result
  }
}

const INITIAL_VALUES = [15, 6, 18, 3, 7, 17, 20, 4, 13, 9]

function Task3() {
  const [bst] = useState(() => {
    const tree = new BST()
    for (const v of INITIAL_VALUES) tree.insert(v)
    return tree
  })

  const [traversal, setTraversal] = useState<number[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)

  function handleTraversal() {
    setTraversal(bst.inOrderTraversal(bst.root))
  }

  function handleSearch() {
    const num = parseInt(searchInput)
    if (isNaN(num)) return
    const found = bst.search(num)
    setSearchResult(found ? `${num} — найден в дереве ✓` : `${num} — не найден ✗`)
  }

  return (
    <div className="app-container">
      <h1>Упражнение 3</h1>
      <h2>Методы класса BST</h2>
      <p>Дерево построено из чисел: {INITIAL_VALUES.join(', ')}</p>

      <div>
        <button onClick={handleTraversal}>Обход In-order</button>
        {traversal.length > 0 && (
          <p>Результат: {traversal.join(', ')}</p>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <input
          type="number"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Введите число для поиска"
          style={{ marginRight: '8px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSearch}>Поиск</button>
        {searchResult !== null && <p>{searchResult}</p>}
      </div>

      <Link to="/2nTask">
        <button>Предыдущий алгоритм</button>
      </Link>
    </div>
  )
}

export default Task3
