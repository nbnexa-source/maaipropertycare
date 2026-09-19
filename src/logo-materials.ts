import * as THREE from "three";

// Outline traced against the supplied GLB's front elevation. The leaf joins the
// left hand at a small bridge, so that component needs its own contour mask.
// Coordinates use a 1100 x 900 inspection view: u = (x + 1) * 500 + 50,
// v = (0.85 - y) * 500 + 25. Unlike world-space cutoffs, this follows the leaf.
const leafOutline = [
  [367, 535], [435, 540], [492, 520], [555, 478], [640, 439],
  [738, 428], [844, 440], [821, 479], [776, 520], [710, 561],
  [668, 601], [628, 658], [615, 682], [497, 680], [481, 650],
  [471, 620], [520, 609], [577, 588], [615, 559], [641, 543],
  [582, 569], [530, 586], [460, 599], [404, 588], [373, 569],
];

function insideLeaf(x: number, y: number): boolean {
  const u = (x + 1) * 500 + 50;
  const v = (0.85 - y) * 500 + 25;
  let inside = false;
  for (let i = 0, j = leafOutline.length - 1; i < leafOutline.length; j = i++) {
    const [xi, yi] = leafOutline[i];
    const [xj, yj] = leafOutline[j];
    if ((yi > v) !== (yj > v) && u < (xj - xi) * (v - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function finishLogo(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  const positions = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!index) throw new Error("The logo finish requires the indexed source GLB.");

  // The source contains positions only. Without normals its metallic surfaces
  // cannot respond to lights and render as the flat silhouette seen previously.
  geometry.computeVertexNormals();
  const parents = Array.from({ length: positions.count }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parents[root] !== root) root = parents[root];
    while (parents[i] !== i) { const next = parents[i]; parents[i] = root; i = next; }
    return root;
  };
  for (let i = 0; i < index.count; i += 3) {
    parents[find(index.getX(i + 1))] = find(index.getX(i));
    parents[find(index.getX(i + 2))] = find(index.getX(i));
  }
  const bounds = new Map<number, THREE.Box3>();
  const point = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    const root = find(i);
    if (!bounds.has(root)) bounds.set(root, new THREE.Box3());
    bounds.get(root)!.expandByPoint(point.fromBufferAttribute(positions, i));
  }
  const green: number[] = [];
  const gold: number[] = [];
  const leaves: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
    const box = bounds.get(find(a))!;
    const handOrCradle = box.min.y < -0.5;
    const leftHandAndLeaf = box.min.x < -0.8;
    const x = (positions.getX(a) + positions.getX(b) + positions.getX(c)) / 3;
    const y = (positions.getY(a) + positions.getY(b) + positions.getY(c)) / 3;
    const isLeaf = leftHandAndLeaf && insideLeaf(x, y);
    (isLeaf ? leaves : handOrCradle ? gold : green).push(a, b, c);
  }
  geometry.setIndex([...green, ...gold, ...leaves]);
  geometry.clearGroups();
  geometry.addGroup(0, green.length, 0);
  geometry.addGroup(green.length, gold.length, 1);
  geometry.addGroup(green.length + gold.length, leaves.length, 2);

  const oldMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mesh.material = [
    new THREE.MeshPhysicalMaterial({ name: "MAAI green enamel", color: "#3d792c", metalness: 0.35, roughness: 0.28, clearcoat: 0.65, clearcoatRoughness: 0.2 }),
    new THREE.MeshPhysicalMaterial({ name: "MAAI warm gold", color: "#d5a14b", metalness: 0.8, roughness: 0.32, clearcoat: 0.25 }),
    new THREE.MeshPhysicalMaterial({ name: "MAAI deep green leaves", color: "#174e32", metalness: 0.35, roughness: 0.28, clearcoat: 0.65, clearcoatRoughness: 0.2 }),
  ];
  oldMaterials.forEach((material) => material.dispose());
}
