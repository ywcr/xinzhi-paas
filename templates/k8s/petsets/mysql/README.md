## Service 对象中必须填的参数（来源于 service.yaml）

1. Name:  .metadata.name   <String> 尽量与 PetSet.metadata.name 相同
2. Namespace: .metadata.namespace <String> 用户自己的命名空间或 team 命名空间
3. Selector: .spec.selector      <Map> key: app, value: 与下面 Pod Labels 相同，保证能够选择到 Pods
4. Labels：   .metadata.labels   <Map> key: app, value: 与下面 Pod Labels 相同，保证能够被选择到

## PetSet 对象中必须填的参数（来源于 petset.yaml)

1. Name (名称) .metadata.name                       <String>   cannot be empty
2. Namespace(命名空间)  .metadata.namespace         <String>   cannot be emtpy，用户自己的命名空间，或team 的命名空间
3. Replicas(副本数)  .spec.replicas                 <Integer>  cannot be null
4. Volumes (存储卷)  .spec.template.spec.volumes    <Array>.push_back({name:xxx, volumeSource:xxx})
5. ServiceName (绑定服务)  .spec.serviceName        <String>   cannot be empty (与 service.yaml 中的 .metadata.name 相同)，最好与 PetSet .metadata.name 也相同
6. Pod Labels （标签）     .spec.template.labels    <Map>      key: app, value: <PetSet Name>
7. MySQL Root Password    .spec.template.containers[0].env  <Array>   .push({name: MYSQL_ROOT_PASSWORD, value:<to be modified>})

## PetSet （持久存储） 对象中必填的参数 (来源于 petset-store.yaml)

暂不考虑